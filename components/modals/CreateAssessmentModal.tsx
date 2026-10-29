"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Modal from "./Modal";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (assessment: unknown) => void;
}
export default function CreateAssessmentModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a sample assessment"
      width="max-w-xl"
    >
      <div className="space-y-5 p-6">
        <p className="text-sm leading-7 text-slate-500">
          Choose a sample job in the assessment builder, then edit the questions
          and settings before assigning it. No AI generation or external
          invitations are connected.
        </p>
        <Link
          href="/recruiter/assessments/new"
          onClick={onClose}
          className="ts-button"
        >
          Open assessment builder <ArrowRight size={15} />
        </Link>
      </div>
    </Modal>
  );
}
