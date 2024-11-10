"use client";
import { ListResearchContextCard, CreateResearchContextDialog, type ResearchContextCardProps } from "@maany_shr/rage-ui-kit";
import type { TListResearchContextsViewModel } from "~/lib/core/view-models/list-research-contexts-view-models";
import type { TCreateResearchContextViewModel } from "~/lib/core/view-models/create-research-context-view-models";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { Signal } from "~/lib/core/entity/signals";
import { useRouter } from "next/navigation";
import type { SelectableSourceDataRow } from "node_modules/@maany_shr/rage-ui-kit/dist/components/table/SelectableSourceDataAGGrid";
import type { RemoteFile } from "~/lib/core/entity/file";
import { createResearchContextMutation, DEFAULT_RETRIES, DEFAULT_RETRY_DELAY, queryResearchContexts } from "~/app/queries";

export function ListResearchContextsClientPage(props: { viewModel: TListResearchContextsViewModel; clientSourceData: RemoteFile[] }) {
  const [listResearchContextsViewModel, setListResearchContextsViewModel] = useState<TListResearchContextsViewModel>(props.viewModel);
  const [createResearchContextViewModel, setCreateResearchContextViewModel] = useState<TCreateResearchContextViewModel>({
    status: "request",
    researchContextName: "",
  } as TCreateResearchContextViewModel);

  const router = useRouter();
  const queryClient = useQueryClient();

  useQuery<Signal<TListResearchContextsViewModel>>({
    queryKey: ["list-research-contexts"],
    queryFn: queryResearchContexts(setListResearchContextsViewModel),
  });

  const createMutation = useMutation({
    mutationKey: ["create-research-context"],
    retry: DEFAULT_RETRIES,
    retryDelay: DEFAULT_RETRY_DELAY,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["list-research-contexts"] });
    },
    mutationFn: createResearchContextMutation(setCreateResearchContextViewModel),
  });

  let cards: ResearchContextCardProps[] = [];
  if (listResearchContextsViewModel.status === "success") {
    cards = listResearchContextsViewModel.researchContexts.map((researchContext) => {
      return {
        callbacks: {
          onNavigateToListConversationPage: () => {
            router.push(`/${researchContext.id}/conversations`);
          },
          onNavigateToSourcesPage: () => {
            router.push(`/${researchContext.id}/sources`);
          },
        },
        description: researchContext.description,
        id: researchContext.id,
        title: researchContext.title,
      };
    });
  }

  let listComponent;

  if (cards.length === 0) {
    const isLoading = listResearchContextsViewModel.status === "request";
    listComponent = <div className="flex w-full grow items-center justify-center">{isLoading ? "Loading..." : "No research contexts found"}</div>;
  } else {
    listComponent = <ListResearchContextCard items={cards} />;
  }

  return (
    <>
      {listComponent}
      <CreateResearchContextDialog
        clientFiles={props.clientSourceData}
        onSubmit={(researchContextName: string, researchContextDescription: string, sourceData: SelectableSourceDataRow[]) => {
          createMutation.mutate({
            title: researchContextName,
            description: researchContextDescription,
            sources: sourceData,
          });
        }}
        viewModel={createResearchContextViewModel}
      />
    </>
  );
}
