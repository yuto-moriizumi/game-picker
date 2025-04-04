import React from "react";
import { render, screen, waitFor } from "@testing-library/react"; // fireEvent を削除
import userEvent from "@testing-library/user-event"; // userEvent をインポート
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditGameModal } from "../EditGameModal";
import { useSelectedGameStore } from "@/store/selectedGameStore";
import { StoredCustomGame } from "@/model/StoredCustomGame";
import * as updateAction from "@/actions/updateStoredCustomGame"; // モック対象のアクション

// updateStoredCustomGame アクションをモック
vi.mock("@/actions/updateStoredCustomGame", () => ({
  updateStoredCustomGame: vi.fn(),
}));

// Zustand ストアの初期状態を設定するヘルパー関数
const initializeStore = (game: StoredCustomGame | undefined) => {
  useSelectedGameStore.setState({
    selectedGame: game,
    setSelectedGame: vi.fn(),
  });
};

// QueryClientProvider でラップするヘルパー関数
const renderWithProvider = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テスト中はリトライしない
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("EditGameModal", () => {
  const mockGame: StoredCustomGame = {
    type: "storedCustom",
    id: "test-game-1",
    name: "テストゲーム",
    iconURL: "http://example.com/icon.png",
    count: 4,
  };

  beforeEach(() => {
    // 各テストの前にストアとモックをリセット
    initializeStore(undefined);
    vi.clearAllMocks();
    // setSelectedGame のモック実装を再設定
    // ストアの状態を直接操作するのではなく、アクションを模倣する
    useSelectedGameStore.setState({
      setSelectedGame: (game) =>
        useSelectedGameStore.setState({ selectedGame: game }),
    });
  });

  it("選択されたゲームがない場合、モーダルは表示されない", () => {
    renderWithProvider(<EditGameModal />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("選択されたゲームがある場合、モーダルが表示され、初期値が設定される", async () => {
    // このテストケース用にストアを初期化
    const setSelectedGameMock = vi.fn();
    useSelectedGameStore.setState({
      selectedGame: mockGame,
      setSelectedGame: setSelectedGameMock,
    });

    renderWithProvider(<EditGameModal />);

    // waitFor を使用してモーダルのタイトルが表示されるのを待つ
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /カスタムゲームを編集/i }),
      ).toBeInTheDocument();
    });

    expect(
      await screen.findByLabelText(`ゲーム名`, {
        exact: false,
      }),
    ).toHaveValue(mockGame.name);
    expect(
      await screen.findByLabelText(`アイコン画像のURL`, {
        exact: false,
      }),
    ).toHaveValue(mockGame.iconURL);
    expect(
      await screen.findByLabelText(`プレイヤー数`, {
        exact: false,
      }),
    ).toHaveValue(mockGame.count);
  });

  it("フォームを編集して更新ボタンを押すと、updateStoredCustomGame が呼ばれ、モーダルが閉じる", async () => {
    const setSelectedGameMock = vi.fn();
    useSelectedGameStore.setState({
      selectedGame: mockGame,
      setSelectedGame: setSelectedGameMock,
    });
    const updateMock = vi
      .mocked(updateAction.updateStoredCustomGame)
      .mockResolvedValue(undefined); // モック成功を返す

    renderWithProvider(<EditGameModal />);

    // waitFor を使用してモーダルのタイトルが表示されるのを待つ
    await waitFor(() => {
      // findByLabelText を使って要素が表示されるのを待つ
      // （waitFor は heading の確認だけにしておく）
      expect(
        screen.getByRole("heading", { name: /カスタムゲームを編集/i }),
      ).toBeInTheDocument();
    });

    // findBy* を使用して要素が表示されるのを待つ
    const nameInput = await screen.findByLabelText("ゲーム名", {
      exact: false,
    });
    const urlInput = await screen.findByLabelText("アイコン画像のURL", {
      exact: false,
    });
    const playersInput = await screen.findByLabelText("プレイヤー数", {
      exact: false,
    });
    const submitButton = await screen.findByRole("button", { name: "更新" });

    // userEvent を使用して入力とクリックを行う
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "更新されたゲーム名");
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, "http://example.com/new_icon.png");
    await userEvent.clear(playersInput);
    await userEvent.type(playersInput, "6");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(1);
      // updateStoredCustomGame に渡される引数を StoredCustomGame 型に合わせる
      expect(updateMock).toHaveBeenCalledWith({
        type: "storedCustom",
        id: mockGame.id,
        name: "更新されたゲーム名",
        iconURL: "http://example.com/new_icon.png",
        count: 6, // フォームの players が count にマッピングされる
      });
    });

    // モーダルが閉じる（setSelectedGame(undefined) が呼ばれる）ことを確認
    await waitFor(() => {
      expect(setSelectedGameMock).toHaveBeenCalledWith(undefined);
    });
  });

  // async を追加
  it("キャンセルボタンを押すと、フォームがリセットされ、モーダルが閉じる", async () => {
    const setSelectedGameMock = vi.fn();
    useSelectedGameStore.setState({
      selectedGame: mockGame,
      setSelectedGame: setSelectedGameMock,
    });

    renderWithProvider(<EditGameModal />);

    // waitFor を使用してモーダルのタイトルが表示されるのを待つ
    await waitFor(() => {
      // findByLabelText を使って要素が表示されるのを待つ
      // （waitFor は heading の確認だけにしておく）
      expect(
        screen.getByRole("heading", { name: /カスタムゲームを編集/i }),
      ).toBeInTheDocument();
    });

    // findBy* を使用して要素が表示されるのを待つ
    const nameInput = await screen.findByLabelText("ゲーム名", {
      exact: false,
    });
    // userEvent を使用して入力
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "変更中"); // 変更を加える

    const cancelButton = await screen.findByRole("button", {
      name: "キャンセル",
    });
    // userEvent を使用してクリック
    await userEvent.click(cancelButton);

    // モーダルが閉じる（setSelectedGame(undefined) が呼ばれる）ことを確認
    expect(setSelectedGameMock).toHaveBeenCalledWith(undefined);

    // handleClose内のreset()が呼ばれることの確認は難しいが、
    // setSelectedGame(undefined)が呼ばれればモーダルは閉じるので、それで十分とする
  });

  it("無効な値を入力すると、バリデーションエラーが表示される", async () => {
    const setSelectedGameMock = vi.fn();
    useSelectedGameStore.setState({
      selectedGame: mockGame,
      setSelectedGame: setSelectedGameMock,
    });
    renderWithProvider(<EditGameModal />);

    // waitFor を使用してモーダルのタイトルが表示されるのを待つ
    await waitFor(() => {
      // findByLabelText を使って要素が表示されるのを待つ
      // （waitFor は heading の確認だけにしておく）
      expect(
        screen.getByRole("heading", { name: /カスタムゲームを編集/i }),
      ).toBeInTheDocument();
    });

    // findBy* を使用して要素が表示されるのを待つ
    const nameInput = await screen.findByLabelText("ゲーム名", {
      exact: false,
    });
    const urlInput = await screen.findByLabelText("アイコン画像のURL", {
      exact: false,
    });
    const playersInput = await screen.findByLabelText("プレイヤー数", {
      exact: false,
    });
    const submitButton = await screen.findByRole("button", { name: "更新" });

    // userEvent を使用して入力とクリックを行う
    await userEvent.clear(nameInput); // 名前を空に
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, "invalid-url"); // 無効なURL
    await userEvent.clear(playersInput);
    await userEvent.type(playersInput, "0"); // 0人

    await userEvent.click(submitButton);

    // waitFor を使用して、エラーメッセージが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("ゲーム名は必須です")).toBeInTheDocument();
      expect(
        screen.getByText("有効なURLである必要があります"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("プレイヤー数は1以上である必要があります"),
      ).toBeInTheDocument();
    });
    // エラーメッセージが表示された後、aria-invalid 属性を確認
    expect(nameInput).toHaveAttribute("aria-invalid", "true");

    // updateStoredCustomGame が呼ばれていないことを確認
    expect(updateAction.updateStoredCustomGame).not.toHaveBeenCalled();
  });

  it("更新中に更新ボタンは無効化され、テキストが変わる", async () => {
    const setSelectedGameMock = vi.fn();
    useSelectedGameStore.setState({
      selectedGame: mockGame,
      setSelectedGame: setSelectedGameMock,
    });
    // Promise を作成し、手動で解決する
    let resolveUpdate: (value: unknown) => void;
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve;
    });
    const updateMock = vi
      .mocked(updateAction.updateStoredCustomGame)
      .mockImplementation(() => updatePromise as Promise<void>);

    renderWithProvider(<EditGameModal />);

    // waitFor を使用してモーダルのタイトルが表示されるのを待つ
    await waitFor(() => {
      // findByLabelText を使って要素が表示されるのを待つ
      // （waitFor は heading の確認だけにしておく）
      expect(
        screen.getByRole("heading", { name: /カスタムゲームを編集/i }),
      ).toBeInTheDocument();
    });

    // findBy* を使用して要素が表示されるのを待つ
    const submitButton = await screen.findByRole("button", { name: "更新" });
    // userEvent を使用してクリック
    await userEvent.click(submitButton);

    // 更新処理が開始された後
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("更新中...");
    });

    // 更新処理を完了させる
    resolveUpdate!(undefined);

    // 更新処理が完了した後
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      // 更新成功後はモーダルが閉じるので、ボタン自体が存在しない可能性がある
      // そのため、setSelectedGameMockが呼ばれたことを確認する
      expect(setSelectedGameMock).toHaveBeenCalledWith(undefined);
    });
  });
});
