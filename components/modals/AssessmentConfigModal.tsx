"use client";
import Link from "next/link";
import Modal from "./Modal";
export default function AssessmentConfigModal({
  isOpen,
  onClose,
  jobTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assessment setup"
      width="max-w-xl"
    >
      <div className="space-y-5 p-6">
        <h2 className="text-xl font-semibold">{jobTitle}</h2>
        <p className="text-sm leading-7 text-slate-500">
          The local assessment builder supports sample questions, draft editing
          and sample candidate assignment. Video interviews, coding execution
          and remote deployment are not connected.
        </p>
        <Link
          href="/recruiter/assessments/new"
          onClick={onClose}
          className="ts-button"
        >
          Open sample builder
        </Link>
      </div>
    </Modal>
  );
}
