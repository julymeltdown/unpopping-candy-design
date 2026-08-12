import { createHash } from "node:crypto";

const approvedDigests = new Map(
  Object.entries({
    "README.md":
      "bea37c3ce95caf63a39fd66ee939566224847a78c276502abc52f63da0a75219",
    "docs/ACCESSIBILITY.md":
      "809d02af2817ed7120adb4341626a433187d6db32324bb0f97ef45b56392e523",
    "docs/AI_ASSISTED_POST_CASE_STUDY.md":
      "eed32d1c517467e213b4c7d4e5b446b617a12ee53367752e4629f56d89a0360e",
    "docs/COMPATIBILITY.md":
      "45766fe0f7a466693bc6a11678a0f63e540d739c285bbc5c4b854af5bfb95a4e",
    "docs/PUBLISHING.md":
      "6e25af3015ed329efbf529db87b017d87db828db1d15aca44998df6b3eef5d0c",
    "docs/SECURITY.md":
      "83dd162480f1ba80beb6fb60d2b88c9bfbf468aca67af36560719a930dfd27d1",
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
