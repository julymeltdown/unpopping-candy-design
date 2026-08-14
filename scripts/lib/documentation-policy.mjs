import { createHash } from "node:crypto";

const approvedDigests = new Map(
  Object.entries({
    "README.md":
      "6d7d973196e10d2c6484d7e813d6df53e5916c818f85acc2c7cc2f51e3bc42ae",
    "docs/ACCESSIBILITY.md":
      "809d02af2817ed7120adb4341626a433187d6db32324bb0f97ef45b56392e523",
    "docs/AI_ASSISTED_POST_CASE_STUDY.md":
      "9c5b845f9364129efda45c665e5d985122cf7c7414efb9d5056506c194f2b3a5",
    "docs/COMPATIBILITY.md":
      "7b543650a5ccd554ed6daac0d0b72ea53e6223619b39e371d3db73fe2c9ba6ba",
    "docs/PUBLISHING.md":
      "48cbecf293649022bf3a484fc4b418555132d5abf2ff071587380c173bd1d98e",
    "docs/QA_REPORT.md":
      "57b9fb34c643981cd5b53df1b82c814f00c8bf810ffc5dc175c5139f6ee5b849",
    "docs/SECURITY.md":
      "4ba84346323d1e3b3e3f01caec6f88daa1e2738b73cf0a4de2b95d35df0c4fdc",
    "docs/STORYBOOK_AI.md":
      "27eb1b821bd9f3c99003745fc038c3a7c81786e3787c7a8d6ac4a14e740ad816",
    "docs/SUPPORT.md":
      "e3677127f58af7130f542d9d94460884b1ae59e346ded16b3a3a1c3da9a9dad7",
    "docs/VERSIONING.md":
      "3a13b640fcecb348c81761cb4319827c0fa64bfb6a26b300056c97aeaf967135",
  }),
);

export const trustPaths = [...approvedDigests.keys()];

export function approvedTrustDocumentErrors(documents) {
  const errors = [];
  for (const [path, expected] of approvedDigests) {
    const source = documents.get(path);
    if (!source) {
      errors.push(`${path}: required trust document is missing`);
      continue;
    }
    const actual = createHash("sha256").update(source).digest("hex");
    if (actual !== expected)
      errors.push(`${path}: content requires an explicit trust-policy review`);
  }
  return errors;
}
