const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Image file is required',
        });
    }

    const url = `/uploads/${req.file.filename}`;

    return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
            url,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        },
    });
};

module.exports = {
    uploadImage,
};
