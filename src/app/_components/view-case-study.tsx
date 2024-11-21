"use client";

import { CaseStudyForm, CaseStudyPage, useToast } from "@maany_shr/rage-ui-kit";
import { CaseStudyParameters } from "@maany_shr/rage-ui-kit";
import { useEffect, useState } from "react";
import { TCaseStudyViewModel } from "~/lib/core/view-models/case-study-view-model";
import { useMutation } from "@tanstack/react-query";
import { caseStudyMutation, DEFAULT_RETRIES, DEFAULT_RETRY_DELAY } from "~/app/queries";

export const ViewCaseStudy = () => {
  const [parameters, setParameters] = useState<CaseStudyParameters | undefined>(undefined);

  const availableCaseStudies = {
    "climate-monitoring": "Climate Monitoring",
    "sentinel-5p": "Sentinel 5P",
  };

  const { toast } = useToast();

  const onSubmit = (parameters: CaseStudyParameters) => {
    if (!Object.keys(availableCaseStudies).includes(parameters.caseStudy)) {
      toast({
        variant: "error",
        title: "No case study is specified",
        description: "Please choose one of the available case studies.",
      });
      return;
    }

    if (Number.isNaN(parameters.jobId) || parameters.tracerId === "" || parameters.jobId < 0) {
      toast({
        variant: "error",
        title: "Wrong parameters specified",
        description: "Please make sure the job ID and tracer ID fields are not empty.",
      });
      return;
    }

    setParameters(parameters);
  };

  const [caseStudyViewModel, setCaseStudyViewModel] = useState<TCaseStudyViewModel>({
    status: "request",
    caseStudyName: "",
    tracerID: "",
    jobID: 1,
  } as TCaseStudyViewModel);

  const createMutation = useMutation({
    mutationKey: ["trigger-case-study"],
    retry: DEFAULT_RETRIES,
    retryDelay: DEFAULT_RETRY_DELAY,
    mutationFn: caseStudyMutation(setCaseStudyViewModel),
  });

  useEffect(() => {
    if (parameters) {
      createMutation.mutate({
        caseStudyName: parameters.caseStudy,
        tracerID: parameters.tracerId,
        jobID: parameters.jobId,
      });
    }
  }, [parameters]);

  if (!parameters) {
    return (
      <div className="flex grow items-center justify-center">
        <CaseStudyForm caseStudies={availableCaseStudies} onSubmit={onSubmit} />
      </div>
    );
  }

  if (caseStudyViewModel.status === "request") {
    return <span>Loading...</span>;
  }

  if (caseStudyViewModel.status === "progress") {
    return <span>{caseStudyViewModel.message}</span>;
  }

  if (caseStudyViewModel.status === "error") {
    return <span>{caseStudyViewModel.message}</span>;
  }

  return <CaseStudyPage info={caseStudyViewModel.keyframeArray} messages={[]} />;
};
