import { Match } from "@/common/types/match";

export interface ConversionResult<InputType> {
  original: InputType;
  bestMatch: Match | null | undefined;
  matches: Array<Match>;
}