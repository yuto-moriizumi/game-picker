import { render, screen, waitFor } from "@testing-library/react";
import Home from "../page";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// モックの設定
vi.mock("@/actions/getGames", () => ({
  getGames: vi.fn().mockResolvedValue({ games: [], lastExecuted: "2023-01-01T00:00:00.000Z" }), // getGames をモックし、空の配列を返すように設定
}));

// GameTableBody コンポーネントをモック (修正)
vi.mock("@/component/GameTableRows", () => ({
  GameTableRows: () => (
    // tbody の中身としてレンダリングされる想定の要素を返す
    // 確認用に tr に test ID を付与
    <tr data-testid="mock-game-table-body-content">
      <td colSpan={4}>Mocked Game Table Body Content</td>
    </tr>
  ),
}));

// AddGameModal と EditGameModal をモック
vi.mock("@/component/AddGameModal", () => ({
  AddGameModal: () => (
    <div data-testid="mock-add-game-modal">Add Game Modal</div>
  ),
}));
vi.mock("@/component/EditGameModal", () => ({
  EditGameModal: () => (
    <div data-testid="mock-edit-game-modal">Edit Game Modal</div>
  ),
}));

describe("Home Page", () => {
  it("コンポーネントが正しくレンダリングされる", async () => {
    // Test用のQueryClientを作成
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Home コンポーネントは非同期なので、render の結果を Promise として扱う
    render(
      <QueryClientProvider client={queryClient}>
        {await Home()}
      </QueryClientProvider>
    );

    // テーブルヘッダーの存在確認
    expect(
      screen.getByRole("columnheader", { name: "名前" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "プレイヤー数" }),
    ).toBeInTheDocument();

    // モックされたコンポーネントの存在確認
    // Suspense の解決を待つ
    await waitFor(() => {
      // 修正した test ID で要素を確認
      expect(
        screen.getByTestId("mock-game-table-body-content"),
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("mock-add-game-modal")).toBeInTheDocument();
    expect(screen.getByTestId("mock-edit-game-modal")).toBeInTheDocument();

    // Provider がレンダリングされていることを確認（直接的な確認は難しいが、エラーなくレンダリングされればOKとする）
    // 必要であれば Provider の内部実装に依存しない形でテストを追加
  });
});
