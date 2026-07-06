const slugify = require('./slugify');
const ApiError = require('./ApiError');

const buildUniqueSlug = async (Model, name, options = {}) => {
    const {
        excludeId = null,
        emptyNameMessage = 'Name must contain valid characters',
    } = options;

    const baseSlug = slugify(name);

    if (!baseSlug) {
        throw new ApiError(400, emptyNameMessage);
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const filter = { slug };

        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        const existing = await Model.findOne(filter).select('_id');

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};

module.exports = buildUniqueSlug;
