import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
// In a real app, you would also update the mock data "database" here
const patientInDb = mockScheduledSurgeries.find(p => p.id === id);
if (patientInDb) {
  // eslint-disable-next-line no-param-reassign
  patientInDb.status = newStatus;
  if (log) {
    // eslint-disable-next-line no-param-reassign
    patientInDb.surgeryLog = log;
  }
}

export default eslintConfig;
