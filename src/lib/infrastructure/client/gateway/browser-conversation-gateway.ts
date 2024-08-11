import { injectable } from "inversify";
import { type CreateConversationDTO, type ListConversationsDTO, type SendMessageToConversationResponseDTO, type ListMessagesForConversationDTO } from "~/lib/core/dto/conversation-gateway-dto";
import { type TMessage } from "~/lib/core/entity/kernel-models";
import type ConversationGatewayOutputPort from "~/lib/core/ports/secondary/conversation-gateway-output-port";

@injectable()
export default class BrowserConversationGateway implements ConversationGatewayOutputPort {
    createConversation(clientID: string, researchContextID: string): Promise<CreateConversationDTO> {
        throw new Error("Method not implemented.");
    }
    listConversations(clientID: string, researchContextID: string): Promise<ListConversationsDTO> {
        throw new Error("Method not implemented.");
    }
    sendMessage(conversationID: string, message: TMessage): Promise<SendMessageToConversationResponseDTO> {
        throw new Error("Method not implemented.");
    }
    getConversationMessages(conversationID: string): Promise<ListMessagesForConversationDTO> {
        throw new Error("Method not implemented.");
    }
}