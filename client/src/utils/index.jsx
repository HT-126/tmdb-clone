import { TMDB_IMAGE_BASE_URL } from "../app/config";

export function getImageUrl(imagePath, size = "w342") {
  if (!imagePath) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "Release date unavailable";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getRatingPercentage(voteAverage) {
  if (!voteAverage) {
    return 0;
  }

  return Math.round(voteAverage * 10);
}
