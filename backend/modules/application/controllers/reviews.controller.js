const { UserReview, User } = require("../../../models/associations");

const getLandingPageReviews = async (req, res, next) => {
  try {
    const reviews = await UserReview.findAll({
      where: { show_on_landing_page: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["fullname", "school_name", "profile_url"],
        }
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      data: reviews.map((r) => ({
        id: r.id,
        name: r.user?.fullname || "Scholarship Student",
        school: r.user?.school_name || "Quiz Master Academy",
        text: r.review_text,
        stars: r.review_rating,
        score: r.scholarship_marks !== null && r.scholarship_marks !== undefined ? `${r.scholarship_marks}/200` : "",
        profile_url: r.user?.profile_url || "",
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandingPageReviews,
};
