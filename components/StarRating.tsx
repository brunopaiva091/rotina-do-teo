'use client';

interface StarRatingProps {
  stars: number;
  onChange: (stars: number) => void;
}

export default function StarRating({ stars, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star === stars ? 0 : star)}
          className={`text-3xl transition-all hover:scale-110 active:scale-95 leading-none ${
            star <= stars ? 'text-yellow-400' : 'text-gray-200'
          }`}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
