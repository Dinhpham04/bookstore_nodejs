import db from '../models/index';

let handleDeleteBanner = async (req, res) => {
    try {
        const bannerId = req.query.bannerId;
        if (!bannerId) {
            res.status(404).json({
                message: 'Banner id is required'
            })
        } else {
            const banner = await db.Banner.findByPk(bannerId);
            if (!banner) {
                res.status(404).json({
                    message: 'Banner not found'
                })
            } else {
                await banner.destroy();
                res.status(200).json({
                    message: 'Banner deleted successfully'
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleUpdateBanner = async (req, res) => {
    try {
        const data = req.body;
        if (!data.bannerId) {
            res.status(400).json({
                message: 'Banner id is required'
            })
        } else {
            const banner = await db.Banner.findByPk(data.bannerId);
            if (!banner) {
                res.status(404).json({
                    message: 'Banner not found'
                })
            } else {
                await banner.update({
                    imageUrl: data.imageUrl,
                    link: data.link
                });
                res.status(200).json({
                    message: 'Banner updated successfully'
                })
            }

        }

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleAddBanner = async (req, res) => {
    try {
        const data = req.body;
        if (!data.imageUrl) {
            res.status(400).json({
                message: 'link and imageUrl are required'
            })
        }
        await db.Banner.create({
            imageUrl: data.imageUrl,
            link: data.link
        })
        res.status(200).json({
            message: 'Banner added successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleGetBanners = async (req, res) => {
    try {
        let banners = await db.Banner.findAll({ raw: true });
        res.status(200).json({
            message: "get banner successfully",
            banners
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleGetBannerById = async (req, res) => {
    try {
        const bannerId = req.query.bannerId;
        if (!bannerId) {
            res.status(400).json({
                message: 'Banner id is required'
            })
        } else {
            const banner = await db.Banner.findByPk(bannerId);
            if (!banner) {
                res.status(404).json({
                    message: 'Banner not found'
                })
            } else {
                res.status(200).json({
                    message: "get banner successfully",
                    banner
                });
            }

        }

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

module.exports = {
    handleDeleteBanner,
    handleUpdateBanner,
    handleAddBanner,
    handleGetBanners,
    handleGetBannerById,
}