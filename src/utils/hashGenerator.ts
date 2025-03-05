import crypto from "node:crypto";

export const generateJobHash = async ({
  title,
  company,
  location,
}: {
  title: string;
  company: string;
  location: string;
}) => {
  const stringToHash = `${title}-${company}-${location}`.toLowerCase();
  return crypto.createHash("sha256").update(stringToHash).digest("hex");
};

export const compareJobHash = async (
  {
    title,
    company,
    location,
  }: {
    title: string;
    company: string;
    location: string;
  },
  hash: string,
): Promise<boolean> => {
  const stringToCompare = `${title}-${company}-${location}`.toLowerCase();
  const generatedHash = crypto
    .createHash("sha256")
    .update(stringToCompare)
    .digest("hex");
  return generatedHash === hash;
};
