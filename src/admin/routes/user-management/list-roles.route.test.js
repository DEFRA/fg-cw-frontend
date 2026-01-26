import { afterEach, describe, expect, it, vi } from "vitest";
import { getRolesUseCase } from "../../../auth/use-cases/get-roles.use-case.js";
import { createRoleListViewModel } from "../../view-models/user-management/role-list.view-model.js";
import { listRolesRoute } from "./list-roles.route.js";

vi.mock("../../../auth/use-cases/get-roles.use-case.js");
vi.mock("../../view-models/user-management/role-list.view-model.js");
vi.mock("../../../common/logger.js");

describe("listRolesRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is configured correctly", () => {
    expect(listRolesRoute.method).toEqual("GET");
    expect(listRolesRoute.path).toEqual("/admin/user-management/roles");
  });

  it("handler gets roles and renders view", async () => {
    const request = {
      auth: {
        credentials: {
          token: "mock-token",
          user: { id: "user-123" },
        },
      },
    };

    const h = {
      view: vi.fn(),
    };

    const mockRoles = [{ code: "ROLE_1" }];
    const mockViewModel = { pageTitle: "Roles" };

    getRolesUseCase.mockResolvedValue(mockRoles);
    createRoleListViewModel.mockReturnValue(mockViewModel);

    await listRolesRoute.handler(request, h);

    expect(getRolesUseCase).toHaveBeenCalledWith({
      token: "mock-token",
      user: { id: "user-123" },
    });

    expect(createRoleListViewModel).toHaveBeenCalledWith(mockRoles);

    expect(h.view).toHaveBeenCalledWith(
      "pages/user-management/role-list",
      mockViewModel,
    );
  });
});
