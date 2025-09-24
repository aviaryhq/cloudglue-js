/**
 * Filter operators for metadata, video info, and file property filtering
 * Used across different APIs for consistent filtering behavior
 */
export enum FilterOperator {
  NotEqual = "NotEqual",
  Equal = "Equal",
  LessThan = "LessThan",
  GreaterThan = "GreaterThan",
  ContainsAny = "ContainsAny",
  ContainsAll = "ContainsAll",
  In = "In",
  Like = "Like"
}
