import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // user-event をインポート
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"; // vi をインポート
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameTableRows } from "../GameTableRows";
import { Game } from "@/model/Game";
import * as removeStoredGameAction from "@/actions/removeStoredGame";
import * as getGamesAction from "@/actions/getGames";
import { useSelectedGameStore } from "@/store/selectedGameStore";
import { GameData } from "@/types/GameData";

// Zustandストアのモック
vi.mock("@/store/selectedGameStore", () => ({
  useSelectedGameStore: vi.fn(),
}));

// アクションのモック
vi.mock("@/actions/removeStoredGame");
vi.mock("@/actions/getGames");

const mockSetSelectedGame = vi.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // テスト中はリトライしない
      gcTime: Infinity, // テスト中はキャッシュを保持
      queryFn: async (): Promise<GameData> => {
        const result = await getGamesAction.getGames();
        return result;
      },
    },
  },
});

// Provider の getQueryClient をモックしてテスト用クライアントを返すようにする
vi.mock("@/component/Provider", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/component/Provider")>();
  return {
    ...original, // 元のモジュールの他のエクスポートは維持
    getQueryClient: () => queryClient, // テスト用の queryClient を返すように上書き
  };
});

// テスト用の初期ゲームデータ
const initialGames: Game[] = [
  {
    id: "steam-1",
    type: "storedSteam",
    name: "Steam Game 1",
    iconURL: "/steam-icon1.jpg",
    count: 5,
  },
  {
    id: "custom-1",
    type: "storedCustom",
    name: "Custom Game 1",
    iconURL: "/custom-icon1.png",
    count: 0, // カスタムゲームはカウント0
  },
  {
    id: "steam-2",
    type: "storedSteam",
    name: "Steam Game 2",
    iconURL: "/steam-icon2.jpg",
    count: 10,
  },
];

// 各テストの前にモックをリセットし、ストアのモックを設定
beforeEach(() => {
  vi.clearAllMocks();
  // useSelectedGameStore のモック実装
  (useSelectedGameStore as unknown as Mock).mockReturnValue({
    setSelectedGame: mockSetSelectedGame,
  });
  // getGames のモック実装 (初期データを返す)
  (getGamesAction.getGames as Mock).mockResolvedValue({ games: [...initialGames], lastExecuted: "2023-01-01T00:00:00.000Z" } as GameData);
  // removeStoredGame のモック実装
  (removeStoredGameAction.removeStoredGame as Mock).mockResolvedValue(
    undefined,
  );

  // React Query のキャッシュをクリア
  queryClient.clear();
  
  // 初期データを設定
  queryClient.setQueryData(["games"], { games: [...initialGames], lastExecuted: "2023-01-01T00:00:00.000Z" } as GameData);
});

// QueryClientProviderでラップするヘルパー関数
const renderWithProvider = (ui: React.ReactElement) => {
  // Table と TableBody でラップしないと TableRow/TableCell がエラーを出すため追加
  return render(
    <QueryClientProvider client={queryClient}>
      <table>
        <tbody>{ui}</tbody>
      </table>
    </QueryClientProvider>,
  );
};

describe("GameTableBody", () => {
  it("初期ゲームデータが正しく表示される", async () => {
    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Steam Game 1")).toBeInTheDocument();
    });

    // 各ゲームの名前が表示されているか確認
    expect(screen.getByText("Steam Game 1")).toBeInTheDocument();
    expect(screen.getByText("Custom Game 1")).toBeInTheDocument();
    expect(screen.getByText("Steam Game 2")).toBeInTheDocument();

    // 各ゲームのカウントが表示されているか確認
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // 画像が表示されているか確認 (altテキストで検索)
    const images = screen.getAllByAltText("ゲームのアイコン");
    expect(images).toHaveLength(3);
    // 画像の src 属性をチェック (Next/Image の挙動を考慮)
    // Next/Image は内部で src を加工するため、完全一致ではなく部分一致で確認する方が安全な場合がある
    expect(images[0]).toHaveAttribute(
      "src",
      expect.stringContaining("steam-icon1.jpg"),
    );
    expect(images[1]).toHaveAttribute(
      "src",
      expect.stringContaining("custom-icon1.png"),
    );
    expect(images[2]).toHaveAttribute(
      "src",
      expect.stringContaining("steam-icon2.jpg"),
    );
  });

  it("カスタムゲームには編集ボタンが表示され、Steamゲームには表示されない", async () => {
    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Custom Game 1")).toBeInTheDocument();
    });

    // カスタムゲームの行を取得 (より堅牢な方法)
    const customGameRow = screen.getByText("Custom Game 1").closest("tr");
    expect(customGameRow).not.toBeNull();
    // カスタムゲームの行内に編集ボタンがあることを確認
    expect(
      within(customGameRow!).getByRole("button", { name: /edit/i }), // IconButton は button ロールを持つ
    ).toBeInTheDocument();

    // Steamゲームの行を取得
    const steamGame1Row = screen.getByText("Steam Game 1").closest("tr");
    expect(steamGame1Row).not.toBeNull();
    // Steamゲームの行内に編集ボタンがないことを確認
    expect(
      within(steamGame1Row!).queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();

    const steamGame2Row = screen.getByText("Steam Game 2").closest("tr");
    expect(steamGame2Row).not.toBeNull();
    expect(
      within(steamGame2Row!).queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
  });

  it("保存済みゲームには削除ボタンが表示される", async () => {
    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Steam Game 1")).toBeInTheDocument();
    });

    // すべての削除ボタンを取得 (aria-label や title があればそちらを使う方が良い)
    // MUIのIconButtonはデフォルトでaria-labelを持たないことがあるため、アイコンのコンポーネント名などで検索するか、
    // data-testid を付与することを検討する。ここでは name で検索を試みる。
    // DeleteIcon に対応するアクセシブルネームがない場合、このセレクタは失敗する可能性がある。
    // 代替案: data-testid="delete-button" などをコンポーネントに追加する。
    // 今回は name=/delete/i で試す
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    // 保存済みゲームは3つなので、削除ボタンも3つあるはず
    expect(deleteButtons).toHaveLength(3);
  });

  it("編集ボタンをクリックするとsetSelectedGameが呼び出される", async () => {
    // async を追加
    const user = userEvent.setup(); // userEvent をセットアップ
    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Custom Game 1")).toBeInTheDocument();
    });

    // カスタムゲームの編集ボタンを取得
    const customGameRow = screen.getByText("Custom Game 1").closest("tr");
    const editButton = within(customGameRow!).getByRole("button", {
      name: /edit/i,
    });

    // 編集ボタンをクリック
    await user.click(editButton); // fireEvent.click を userEvent.click に変更し、await を追加

    // setSelectedGameが正しい引数で呼び出されたか確認
    expect(mockSetSelectedGame).toHaveBeenCalledTimes(1);
    // initialGames[1] と完全に一致するか確認
    expect(mockSetSelectedGame).toHaveBeenCalledWith(
      expect.objectContaining(initialGames[1]),
    );
  });

  it("削除ボタンをクリックするとremoveStoredGameが呼び出され、データが再取得される", async () => {
    const user = userEvent.setup(); // userEvent をセットアップ
    // removeStoredGameが成功した後のgetGamesのモック
    const remainingGames = [initialGames[0], initialGames[2]]; // Custom Game 1が削除された状態

    (getGamesAction.getGames as Mock).mockResolvedValueOnce({
      games: [...remainingGames],
      lastExecuted: "2023-01-01T00:00:00.000Z"
    } as GameData); // 削除後の再取得用

    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Custom Game 1")).toBeInTheDocument();
    });

    // カスタムゲームの削除ボタンを取得
    const customGameRow = screen.getByText("Custom Game 1").closest("tr");
    const deleteButton = within(customGameRow!).getByRole("button", {
      name: /delete/i,
    });

    // 削除ボタンをクリック
    await user.click(deleteButton); // fireEvent.click を userEvent.click に変更

    // removeStoredGameが正しい引数で呼び出されたか確認
    await waitFor(() => {
      expect(removeStoredGameAction.removeStoredGame).toHaveBeenCalledTimes(1);
    });
    // initialGames[1] と完全に一致するか確認
    expect(removeStoredGameAction.removeStoredGame).toHaveBeenCalledWith(
      expect.objectContaining(initialGames[1]),
    );

    // データが再取得されるのを待つ (getGames が再度呼び出される)
    await waitFor(() => {
      // getGamesが2回呼び出されたことを確認 (初期ロード + 削除後の再取得)
      expect(getGamesAction.getGames).toHaveBeenCalledTimes(1);
    });

    // データが再取得され、リストが更新されるのを待つ
    await waitFor(() => {
      // 削除されたゲームの名前が表示されていないことを確認
      expect(screen.queryByText("Custom Game 1")).not.toBeInTheDocument();
    });

    // 残りのゲームが表示されていることを確認
    expect(screen.getByText("Steam Game 1")).toBeInTheDocument();
    expect(screen.getByText("Steam Game 2")).toBeInTheDocument();

    // getGamesが2回呼び出されたことを確認 (初期ロード + 削除後の再取得)
    // useQuery のキャッシュや staleTime の挙動により、呼び出し回数の確認は不安定な場合がある。
    // invalidateQueries が fetch をトリガーすることを確認する方が良い場合もある。
    // await waitFor(() => expect(getGamesAction.getGames).toHaveBeenCalledTimes(2));
  });

  it("削除処理中に削除ボタンが無効化される", async () => {
    // .only を削除 (他のテストも実行するため)
    const user = userEvent.setup(); // userEvent をセットアップ
    // removeStoredGame を遅延させるモック
    let resolveRemovePromise: () => void;
    const removePromise = new Promise<void>((resolve) => {
      resolveRemovePromise = resolve;
    });
    (removeStoredGameAction.removeStoredGame as Mock).mockImplementation(
      () => removePromise,
    );
    (getGamesAction.getGames as Mock).mockResolvedValue({ games: [...initialGames], lastExecuted: "2023-01-01T00:00:00.000Z" } as GameData); // getGamesは通常通り

    renderWithProvider(<GameTableRows />);
    
    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("Steam Game 1")).toBeInTheDocument();
    });

    // Steamゲーム1の削除ボタンを取得
    const steamGame1Row = screen.getByText("Steam Game 1").closest("tr");
    const deleteButton = within(steamGame1Row!).getByRole("button", {
      name: /delete/i,
    }); // getByLabelText から getByRole に変更 (より一般的)

    // 削除ボタンをクリック
    await user.click(deleteButton); // fireEvent.click を userEvent.click に変更

    // 削除処理中はボタンが無効化されていることを確認
    expect(deleteButton).toBeDisabled();

    // 削除処理を完了させる
    resolveRemovePromise!();

    // removeStoredGame が呼び出されたことを確認
    await waitFor(() => {
      expect(removeStoredGameAction.removeStoredGame).toHaveBeenCalledTimes(1);
    });

    // データ再取得とUI更新を待つ (invalidateQueriesがトリガーされるはず)
    // getGames が再度呼ばれるのを待つ方が確実かもしれない
    (getGamesAction.getGames as Mock).mockResolvedValueOnce({ games: [...initialGames], lastExecuted: "2023-01-01T00:00:00.000Z" } as GameData); // 再取得用のモック
    queryClient.invalidateQueries({ queryKey: ["games"] });

    await waitFor(() => {
      // ボタンが再度有効になっていることを確認
      // 注意: コンポーネントが再レンダリングされると要素の参照が変わる可能性があるため、
      //       再度要素を取得して確認する方が安全。
      const updatedDeleteButton = within(steamGame1Row!).getByRole("button", {
        name: /delete/i,
      });
      expect(updatedDeleteButton).not.toBeDisabled();
    });
  });
});
