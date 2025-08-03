import { ScoreDetails } from "@/common/types/score";

export interface Match {
  thumbnailUrl: string | null;
  title: string;
  url: string;
  totalScore: number;
  scoreDetails: ScoreDetails;
}