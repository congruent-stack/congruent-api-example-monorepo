import { DecoratorHandlerContext, DecoratorHandlerInput, DecoratorHandlerOutput, HttpStatusCode, IEndpointHandlerDecorator, RoleCheckDecoratorSchemas } from "@congruent-stack/example-monorepo-contract";
import { container } from "./setup.js";

export interface RoleCheckDecoratorParams {
  roles: string[];
}

export class RoleCheckDecorator implements IEndpointHandlerDecorator<RoleCheckDecoratorSchemas> {
  private roles: string[];

  constructor(params: RoleCheckDecoratorParams) {
    this.roles = params.roles;
  }

  static create(_scope: ReturnType<typeof container.createScope>, params: RoleCheckDecoratorParams): RoleCheckDecorator {
    return new RoleCheckDecorator(params);
  }
  
  async handle(req: DecoratorHandlerInput<RoleCheckDecoratorSchemas>, ctx: DecoratorHandlerContext): Promise<DecoratorHandlerOutput<RoleCheckDecoratorSchemas>> {
    const headerValue = req.headers["x-my-secret-header"];
    const role = headerValue.split('-').pop();
    if (!role) {
      return {
        code: HttpStatusCode.Forbidden_403,
        body: {
          userMessage: "You must have a role to access this resource"
        }
      }
    }
    const hasRequiredRole = this.roles.includes(role);
    if (!hasRequiredRole) {
      return {
        code: HttpStatusCode.Forbidden_403,
        body: { 
          userMessage: "Insufficient role to access this resource"
        }
      }
    }
    await ctx.next();
  }
}