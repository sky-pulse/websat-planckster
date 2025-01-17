/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { Container, type interfaces } from "inversify";
import { CONSTANTS, GATEWAYS, KERNEL, OPENAI, TRPC, UTILS, CONTROLLERS, USECASE_FACTORY, REPOSITORIES } from "./server-ioc-symbols";
import { authOptions } from "~/lib/infrastructure/server/config/auth/next-auth-config";
import type AuthGatewayOutputPort from "~/lib/core/ports/secondary/auth-gateway-output-port";
import NextAuthGateway from "~/lib/infrastructure/server/gateway/next-auth-gateway";
import { appRouter } from "~/lib/infrastructure/server/trpc/app-router";
import { api } from "~/lib/infrastructure/server/trpc/server-api";
import OpenAIAgentGateway from "../../gateway/openai-agent-gateway";
import OpenAIClient from "../openai/openai-client";
import { KernelSDK } from "../kernel/kernel-sdk";
import type { Logger } from "pino";
import rootLogger from "../log/pino-server-config";
import OpenAISourceDataGateway from "../../gateway/openai-source-data-gateway";
import KernelSourceDataGateway from "../../gateway/kernel-source-data-gateway";
import ListResearchContextsController from "../../controller/list-research-contexts-controller";
import ResearchContextGateway from "../../gateway/research-context-gateway";
import OpenAIVectorStoreGateway from "../../gateway/openai-vector-store-gateway";
import KernelConversationGateway from "../../gateway/kernel-conversation-gateway";
import CreateConversationController from "../../controller/create-conversation-controller";
import ListConversationsController from "../../controller/list-conversations-controller";
import ListMessagesForConversationController from "../../controller/list-messages-for-conversation-controller";
import ListSourceDataController from "../../controller/list-source-data-controller";
import { type CreateConversationInputPort } from "~/lib/core/ports/primary/create-conversation-primary-ports";
import CreateConversationUsecase from "~/lib/core/usecase/create-conversation-usecase";
import { type ListConversationsInputPort } from "~/lib/core/ports/primary/list-conversations-primary-ports";
import ListConversationsUsecase from "~/lib/core/usecase/list-conversations-usecase";
import { type ListSourceDataInputPort } from "~/lib/core/ports/primary/list-source-data-primary-ports";
import ListSourceDataUsecase from "~/lib/core/usecase/list-source-data-usecase";
import { type TListConversationsViewModel } from "~/lib/core/view-models/list-conversations-view-model";
import { type Signal } from "~/lib/core/entity/signals";
import ListConversationsPresenter from "../../presenter/list-conversations-presenter";
import { type TCreateConversationViewModel } from "~/lib/core/view-models/create-conversation-view-model";
import CreateConversationPresenter from "../../presenter/create-conversation-presenter";
import { type ListMessagesForConversationInputPort } from "~/lib/core/ports/primary/list-messages-for-conversation-primary-ports";
import { type TListMessagesForConversationViewModel } from "~/lib/core/view-models/list-messages-for-conversation-view-model";
import ListMessagesForConversationPresenter from "../../presenter/list-messages-for-conversation-presenter";
import ListMessagesForConversationUsecase from "~/lib/core/usecase/list-messages-for-conversation-usecase";
import { type TListSourceDataViewModel } from "~/lib/core/view-models/list-source-data-view-models";
import ListSourceDataPresenter from "../../presenter/list-source-data-presenter";
import KernelResearchContextGateway from "../../gateway/kernel-research-context-gateway";
import { type ListResearchContextsInputPort } from "~/lib/core/ports/primary/list-research-contexts-primary-ports";
import { type TListResearchContextsViewModel } from "~/lib/core/view-models/list-research-contexts-view-models";
import ListResearchContextsUsecase from "~/lib/core/usecase/list-research-context-usecase";
import ListResearchContextsPresenter from "../../presenter/list-research-contexts-presenter";
import SDACaseStudyRepository from "../../repository/sda-case-study-repository";

const serverContainer = new Container();

/** TRPC */
serverContainer.bind(TRPC.APP_ROUTER).toConstantValue(appRouter);

/** TRPC Server API : Should be used ONLY in Server Components */
serverContainer.bind(TRPC.REACT_SERVER_COMPONENTS_API).toConstantValue(api);

/** Aspect: Auth */
serverContainer.bind(CONSTANTS.NEXT_AUTH_OPTIONS).toConstantValue(authOptions);
serverContainer.bind<AuthGatewayOutputPort>(GATEWAYS.AUTH_GATEWAY).to(NextAuthGateway).inSingletonScope();

/** Aspect: Logging */
serverContainer.bind<interfaces.Factory<Logger>>(UTILS.LOGGER_FACTORY).toFactory<Logger, [string]>((context: interfaces.Context) => (module: string) => {
  const logger = rootLogger.child({ module: module });
  return logger;
});

/** OPENAI */
serverContainer.bind(OPENAI.OPENAI_CLIENT).toConstantValue(OpenAIClient);
serverContainer.bind(OPENAI.OPENAI_SOURCE_DATA_GATEWAY).to(OpenAISourceDataGateway);

/** KERNEL */
serverContainer.bind(KERNEL.KERNEL_SDK).toConstantValue(KernelSDK);

/** GATEWAYS */
serverContainer.bind(GATEWAYS.AGENT_GATEWAY).to(OpenAIAgentGateway);
serverContainer.bind(GATEWAYS.KERNEL_CONVERSATION_GATEWAY).to(KernelConversationGateway);
serverContainer.bind(GATEWAYS.KERNEL_SOURCE_DATA_GATEWAY).to(KernelSourceDataGateway);
serverContainer.bind(GATEWAYS.KERNEL_RESEARCH_CONTEXT_GATEWAY).to(KernelResearchContextGateway);
serverContainer.bind(GATEWAYS.RESEARCH_CONTEXT_GATEWAY).to(ResearchContextGateway);
serverContainer.bind(GATEWAYS.VECTOR_STORE_GATEWAY).to(OpenAIVectorStoreGateway);

/** REPOSITORY */
serverContainer.bind(REPOSITORIES.SDA_CASE_STUDY_REPOSITORY).to(SDACaseStudyRepository);

/** CONTROLLERS */
serverContainer.bind(CONTROLLERS.CREATE_CONVERSATION_CONTROLLER).to(CreateConversationController);
serverContainer.bind(CONTROLLERS.LIST_CONVERSATIONS_CONTROLLER).to(ListConversationsController);
serverContainer.bind(CONTROLLERS.LIST_MESSAGES_CONTROLLER).to(ListMessagesForConversationController);
serverContainer.bind(CONTROLLERS.LIST_RESEARCH_CONTEXTS_CONTROLLER).to(ListResearchContextsController);
serverContainer.bind(CONTROLLERS.LIST_SOURCE_DATA_CONTROLLER).to(ListSourceDataController);

/** USECASES */
// CreateConversationUsecase
serverContainer
  .bind<interfaces.Factory<CreateConversationInputPort>>(USECASE_FACTORY.CREATE_CONVERSATION)
  .toFactory<CreateConversationInputPort, [Signal<TCreateConversationViewModel>]>((context: interfaces.Context) => (response: Signal<TCreateConversationViewModel>) => {
    const conversationGateway = context.container.get<KernelConversationGateway>(GATEWAYS.KERNEL_CONVERSATION_GATEWAY);
    const loggerFactory = context.container.get<(module: string) => Logger>(UTILS.LOGGER_FACTORY);
    const presenter = new CreateConversationPresenter(response, loggerFactory);
    const usecase = new CreateConversationUsecase(presenter, conversationGateway);
    return usecase;
  });

// ListConversationsUsecase
serverContainer
  .bind<interfaces.Factory<ListConversationsInputPort>>(USECASE_FACTORY.LIST_CONVERSATIONS)
  .toFactory<ListConversationsInputPort, [Signal<TListConversationsViewModel>]>((context: interfaces.Context) => (response: Signal<TListConversationsViewModel>) => {
    const conversationGateway = context.container.get<KernelConversationGateway>(GATEWAYS.KERNEL_CONVERSATION_GATEWAY);
    const loggerFactory = context.container.get<(module: string) => Logger>(UTILS.LOGGER_FACTORY);
    const presenter = new ListConversationsPresenter(response, loggerFactory);
    const usecase = new ListConversationsUsecase(presenter, conversationGateway);
    return usecase;
  });

// ListMessagesForConversationUsecase
serverContainer
  .bind<interfaces.Factory<ListMessagesForConversationInputPort>>(USECASE_FACTORY.LIST_MESSAGES_FOR_CONVERSATION)
  .toFactory<ListMessagesForConversationInputPort, [Signal<TListMessagesForConversationViewModel>]>((context: interfaces.Context) => (response: Signal<TListMessagesForConversationViewModel>) => {
    const conversationGateway = context.container.get<KernelConversationGateway>(GATEWAYS.KERNEL_CONVERSATION_GATEWAY);
    const loggerFactory = context.container.get<(module: string) => Logger>(UTILS.LOGGER_FACTORY);
    const presenter = new ListMessagesForConversationPresenter(response, loggerFactory);
    const usecase = new ListMessagesForConversationUsecase(presenter, conversationGateway);
    return usecase;
  });

// ListSourceDataUsecase
serverContainer
  .bind<interfaces.Factory<ListSourceDataInputPort>>(USECASE_FACTORY.LIST_SOURCE_DATA)
  .toFactory<ListSourceDataInputPort, [Signal<TListSourceDataViewModel>]>((context: interfaces.Context) => (response: Signal<TListSourceDataViewModel>) => {
    const sourceDataGateway = context.container.get<KernelSourceDataGateway>(GATEWAYS.KERNEL_SOURCE_DATA_GATEWAY);
    const loggerFactory = context.container.get<(module: string) => Logger>(UTILS.LOGGER_FACTORY);
    const presenter = new ListSourceDataPresenter(response, loggerFactory);
    const usecase = new ListSourceDataUsecase(presenter, sourceDataGateway);
    return usecase;
  });

// ListResearchContextsUsecase
serverContainer
  .bind<interfaces.Factory<ListResearchContextsInputPort>>(USECASE_FACTORY.LIST_RESEARCH_CONTEXTS)
  .toFactory<ListResearchContextsInputPort, [Signal<TListResearchContextsViewModel>]>((context: interfaces.Context) => (response: Signal<TListResearchContextsViewModel>) => {
    const sourceDataGateway = context.container.get<KernelResearchContextGateway>(GATEWAYS.KERNEL_RESEARCH_CONTEXT_GATEWAY);
    const presenter = new ListResearchContextsPresenter(response);
    const usecase = new ListResearchContextsUsecase(presenter, sourceDataGateway);
    return usecase;
  });

export default serverContainer;
