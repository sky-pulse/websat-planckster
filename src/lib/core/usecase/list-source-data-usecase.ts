import { string } from "zod";
import { type ListSourceDataInputPort } from "../ports/primary/list-source-data-primary-ports";
import type SourceDataGatewayOutputPort from "../ports/secondary/source-data-gateway-output-port";
import { type TListSourceDataRequest, type TListSourceDataResponse } from "../usecase-models/list-source-data-view-models";

export default class ListSourceDataUsecase implements ListSourceDataInputPort {
  sourceDataGateway: SourceDataGatewayOutputPort;

  constructor(sourceDataGateway: SourceDataGatewayOutputPort) {
    this.sourceDataGateway = sourceDataGateway;
  }

  async execute(request: TListSourceDataRequest): Promise<TListSourceDataResponse> {
    try {
      const { researchContextID } = request;

      let dto;

      if (!researchContextID) {
        
        dto = await this.sourceDataGateway.list();

      } else {

        dto = await this.sourceDataGateway.listForResearchContext(researchContextID);

      }

      if (!dto.success) {
        return {
          status: "error",
          message: dto.data.message,
          operation: "usecase#list-source-data",
          context: {
            researchContextId: request.researchContextID,
          },
        };
      }

      // NOTE: Need to parse the DTO data to get what we need for the view model
      // if something in the gateway changes, this will need to be updated
      const fileList = dto.data;

      const remoteFileList = fileList.filter(
        (file): file is { type: "remote"; id: string; name: string; relativePath: string; provider: string; createdAt: string; } => file.type === "remote"
      );

      return {
        status: "success",
        sourceData: remoteFileList,
      };


    } catch (error) {
      const err = error as Error;
      return {
        status: "error",
        message: err.message,
        operation: "usecase#list-source-data",
        context: {
          researchContextId: request.researchContextID,
        },
      };
    }
  }
}