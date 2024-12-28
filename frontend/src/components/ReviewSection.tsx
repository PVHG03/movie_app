import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authUser";

interface Review {
  id: string;
  user: {
    username: string;
    id: string;
  };
  comment: string;
  createdAt: string;
  rating: number;
}

interface ReviewSectionProps {
  mediaId: string;
  mediaType: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ mediaId, mediaType }) => {
  const { user } = useAuthStore() as any;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/api/v1/reviews/${mediaType}/${mediaId}`);
        setReviews(res.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [mediaId, mediaType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.trim() || rating < 1 || rating > 5) {
      alert("Please provide a valid review and rating (1-5).");
      return;
    }

    try {
      if (editMode && editReviewId) {
        // Edit existing review
        const res = await axios.put(`/api/v1/reviews/${editReviewId}`, {
          comment: newReview,
          rating,
        });
        setReviews((prev) =>
          prev.map((review) =>
            review.id === editReviewId ? res.data.review : review
          )
        );
        setEditMode(false);
        setEditReviewId(null);
      } else {
        // Post a new review
        const res = await axios.post(`/api/v1/reviews/${mediaType}/${mediaId}`, {
          username: user?.username || "Anonymous",
          rating,
          comment: newReview,
        });
        setReviews((prev) => [...prev, res.data.review]);
      }
      setNewReview("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleEdit = (reviewId: string) => {
    const review = reviews.find((review) => review.id === reviewId);
    if (review) {
      setNewReview(review.comment);
      setRating(review.rating);
      setEditMode(true);
      setEditReviewId(reviewId);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await axios.delete(`/api/v1/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <div id='review-section' className="mt-8">
      <h3 className="text-3xl font-bold mb-4">Reviews</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="rating" className="block text-lg mb-2">
              Rating (1-5):
            </label>
            <input
              id="rating"
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min={1}
              max={5}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="review" className="block text-lg mb-2">
              Write a Review:
            </label>
            <textarea
              id="review"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              editMode
                ? "bg-green-500 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {editMode ? "Update Review" : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500">Please log in to write a review.</p>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review?.id}
              className="p-4 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <p className="font-bold">{review?.user?.username}</p>
              <p className="mt-2">{review?.comment}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(review.createdAt).toLocaleString()} | Rating: {review?.rating}
              </p>

              {user && user?.id === review?.user?.id && (
                <div className="flex justify-end">
                  <button
                    className="text-blue-500 mt-2 mr-6"
                    onClick={() => handleEdit(review.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 mt-2"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
      )}
    </div>
  );
};

export default ReviewSection;
