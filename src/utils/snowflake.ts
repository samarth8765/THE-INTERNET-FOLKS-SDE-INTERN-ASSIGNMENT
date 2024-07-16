import { Snowflake } from "@theinternetfolks/snowflake";

export const generateSnowFlakeId = (): string => {
  return Snowflake.generate();
};
