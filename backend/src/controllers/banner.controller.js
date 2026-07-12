const { Banner } = require('../models/banner.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { getBannerStatus } = require('../../../shared/utils/temporalStatus');
const { buildPagination, parsePaginationQuery } = require('../utils/pagination');

const normalizeBannerPayload = (payload = {}) => ({
    ...payload,
    title: payload.title !== undefined ? payload.title.trim() : undefined,
    tag: payload.tag !== undefined ? payload.tag.trim() : undefined,
    subtitle: payload.subtitle !== undefined ? payload.subtitle.trim() : undefined,
    imageUrl: payload.imageUrl !== undefined ? payload.imageUrl.trim() : undefined,
    buttonText: payload.buttonText !== undefined ? payload.buttonText.trim() : undefined,
});

const formatBanner = (banner, now = new Date()) => ({
    id: banner._id,
    title: banner.title,
    tag: banner.tag,
    subtitle: banner.subtitle,
    imageUrl: banner.imageUrl,
    buttonText: banner.buttonText,
    placement: banner.placement,
    sortOrder: banner.sortOrder,
    startsAt: banner.startsAt,
    expiresAt: banner.expiresAt,
    isActive: banner.isActive,
    status: getBannerStatus(banner, now),
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
});

const formatStoreBanner = (banner) => ({
    id: String(banner._id),
    title: banner.title,
    tag: banner.tag,
    subtitle: banner.subtitle,
    imageUrl: banner.imageUrl,
    buttonText: banner.buttonText,
    placement: banner.placement,
    sortOrder: banner.sortOrder,
});

const buildActiveBannerFilter = (placement, now = new Date()) => ({
    placement,
    isActive: true,
    $and: [
        {
            $or: [
                { startsAt: null },
                { startsAt: { $lte: now } },
            ],
        },
        {
            $or: [
                { expiresAt: null },
                { expiresAt: { $gte: now } },
            ],
        },
    ],
});

const getBanners = async (req, res) => {
    const { page, limit } = parsePaginationQuery(req.query);
    const search = req.query.search?.trim();
    const statusFilter = req.query.status?.trim();
    const placementFilter = req.query.placement?.trim();

    const filter = {};

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { title: { $regex: safeSearch, $options: 'i' } },
            { tag: { $regex: safeSearch, $options: 'i' } },
            { subtitle: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    if (placementFilter) {
        filter.placement = placementFilter;
    }

    const banners = await Banner.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

    const now = new Date();
    const formattedBanners = banners.map((banner) => formatBanner(banner, now));
    const filteredBanners = statusFilter
        ? formattedBanners.filter((banner) => banner.status === statusFilter)
        : formattedBanners;

    const total = filteredBanners.length;
    const paginationMeta = buildPagination(page, limit, total);
    const safePage = Math.min(paginationMeta.page, paginationMeta.totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedBanners = filteredBanners.slice(startIndex, startIndex + limit);

    return res.status(200).json({
        success: true,
        data: paginatedBanners,
        pagination: buildPagination(safePage, limit, total),
    });
};

const getStoreBanners = async (req, res) => {
    const placement = req.query.placement || 'hero';
    const now = new Date();

    const banners = await Banner.find(buildActiveBannerFilter(placement, now))
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: banners.map(formatStoreBanner),
    });
};

const createBanner = async (req, res) => {
    const payload = normalizeBannerPayload(req.body);

    const banner = await Banner.create(payload);

    return res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: formatBanner(banner),
    });
};

const updateBanner = async (req, res) => {
    const { id } = req.params;
    const payload = normalizeBannerPayload(req.body);

    const banner = await Banner.findById(id);

    if (!banner) {
        throw new ApiError(404, 'Banner not found');
    }

    Object.assign(banner, payload);
    await banner.save();

    return res.status(200).json({
        success: true,
        message: 'Banner updated successfully',
        data: formatBanner(banner),
    });
};

const deleteBanner = async (req, res) => {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
        throw new ApiError(404, 'Banner not found');
    }

    return res.status(200).json({
        success: true,
        message: 'Banner deleted successfully',
    });
};

module.exports = {
    getBanners,
    getStoreBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
