import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

interface ReviewFormProps {
  serviceProviderId: string;
  requestId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ serviceProviderId, requestId, onReviewSubmitted }) => {
  const { createReview } = useData();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await createReview({
        serviceProviderId,
        requestId,
        rating,
        comment,
      });
      
      toast.success("Review submitted successfully!");
      onReviewSubmitted();
    } catch (error) {
      toast.error("Failed to submit review: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="rating" className="text-sm font-medium">
          Rating
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="text-2xl focus:outline-none"
            >
              {value <= rating ? "★" : "☆"}
            </button>
          ))}
          <span className="ml-2">{rating}/5</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this service provider..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onReviewSubmitted}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
