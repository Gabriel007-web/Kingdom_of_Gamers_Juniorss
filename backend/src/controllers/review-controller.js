const { reviewService } = require('../services/review-service');

const reviewController = {
  async list(req, res) { res.json({ data: await reviewService.list(req.params.slug) }); },
  async save(req, res) {
    const review = await reviewService.save(req.user.id, req.params.slug, req.validated.body.rating, req.validated.body.comment);
    res.status(201).json({ data: review });
  },
};

module.exports = { reviewController };
