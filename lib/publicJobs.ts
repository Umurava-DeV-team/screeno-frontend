import type { DemoJob } from "./demo/types";
export type PublicJob = Pick<
  DemoJob,
  | "id"
  | "title"
  | "company"
  | "department"
  | "location"
  | "salaryRange"
  | "description"
  | "experienceLevel"
>;
export function filterPublicJobs(
  jobs: DemoJob[],
  query: string,
  location: string,
): PublicJob[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const area = location.trim().toLowerCase();
  return jobs
    .filter(
      (job) =>
        job.status === "active" &&
        (!area || job.location.toLowerCase().includes(area)) &&
        words.every((word) =>
          [job.title, job.company, job.department]
            .join(" ")
            .toLowerCase()
            .includes(word),
        ),
    )
    .map(
      ({
        id,
        title,
        company,
        department,
        location,
        salaryRange,
        description,
        experienceLevel,
      }) => ({
        id,
        title,
        company,
        department,
        location,
        salaryRange,
        description,
        experienceLevel,
      }),
    );
}
