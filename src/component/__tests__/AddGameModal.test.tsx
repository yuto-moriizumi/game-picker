import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddGameModal } from "../AddGameModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "../Provider"; // ProviderからgetQueryClientをインポート
// モック対象の関数をインポート (vi.mockの後)
import { addStoredSteamGame } from "@/actions/addStoredSteamGame";
import { addStoredCustomGame } from "@/actions/addStoredCustomGame";
// jest-domのマッチャーを使用可能にする
import "@testing-library/jest-dom";

// actionsのモック
vi.mock("@/actions/addStoredSteamGame");
vi.mock("@/actions/addStoredCustomGame");

// getQueryClientのモック設定
vi.mock("./Provider", () => ({
  getQueryClient: () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // テスト中はリトライしない
        },
      },
    }),
}));

// QueryClientProviderでラップするヘルパー関数
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = getQueryClient(); // モックされたgetQueryClientを使用
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("AddGameModal", () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    vi.clearAllMocks();
    // クエリクライアントのキャッシュもクリアする場合があります
    getQueryClient().clear();
  });

  it("「ゲームを追加」ボタンが表示される", () => {
    renderWithClient(<AddGameModal />);
    expect(
      screen.getByRole("button", { name: /ゲームを追加/i }),
    ).toBeInTheDocument();
  });

  it("「ゲームを追加」ボタンをクリックするとモーダルが開く", async () => {
    renderWithClient(<AddGameModal />);
    const addButton = screen.getByRole("button", { name: /ゲームを追加/i });
    fireEvent.click(addButton);

    // モーダルが開くまで待機 (MUIのModalは非同期で表示されることがある)
    await waitFor(() => {
      // モーダル内の要素が表示されることを確認
      expect(
        screen.getByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /カスタムゲームを追加/i }),
      ).toBeInTheDocument();
    });
  });

  it("モーダルが開いたとき、デフォルトでSteamタブが選択されている", async () => {
    renderWithClient(<AddGameModal />);
    fireEvent.click(screen.getByRole("button", { name: /ゲームを追加/i }));

    await waitFor(() => {
      const steamTab = screen.getByRole("tab", {
        name: /Steamゲームを追加 \(ID\)/i,
      });
      expect(steamTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByLabelText(/SteamアプリID/i)).toBeInTheDocument();
    });
  });

  it("カスタムタブをクリックするとカスタムフォームが表示される", async () => {
    renderWithClient(<AddGameModal />);
    fireEvent.click(screen.getByRole("button", { name: /ゲームを追加/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
      ).toBeInTheDocument();
    });

    const customTab = screen.getByRole("tab", {
      name: /カスタムゲームを追加/i,
    });
    fireEvent.click(customTab);

    await waitFor(() => {
      expect(customTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByLabelText(/ゲーム名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/アイコン画像のURL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/プレイヤー数/i)).toBeInTheDocument(); // プレイヤー数フィールドを確認
    });
  });

  // --- Steamゲーム追加のテスト ---
  describe("Steamゲーム追加", () => {
    beforeEach(async () => {
      renderWithClient(<AddGameModal />);
      fireEvent.click(screen.getByRole("button", { name: /ゲームを追加/i }));
      // モーダルが開くまで待機
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
        ).toBeInTheDocument();
      });
    });

    it("有効なSteam IDを入力して送信するとaddStoredSteamGameが呼ばれる", async () => {
      // トップレベルでインポートしたモック関数を使用
      const idInput = screen.getByLabelText(/SteamアプリID/i);
      const submitButton = screen.getByRole("button", {
        name: "Steamゲームを追加",
      }); // ボタンのテキストを正確に指定

      fireEvent.change(idInput, { target: { value: "12345" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addStoredSteamGame).toHaveBeenCalledTimes(1);
        expect(addStoredSteamGame).toHaveBeenCalledWith("12345", expect.anything());
      });

      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(
          screen.queryByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("無効なSteam ID（空）を入力して送信するとエラーメッセージが表示される", async () => {
      const submitButton = screen.getByRole("button", {
        name: "Steamゲームを追加",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // 空入力時にtypeErrorメッセージが表示されるか確認
        expect(
          screen.getByText("IDは数値である必要があります"),
        ).toBeInTheDocument();
      });
      // トップレベルでインポートしたモック関数を使用
      expect(addStoredSteamGame).not.toHaveBeenCalled();
    });

    it("無効なSteam ID（文字列）を入力して送信するとエラーメッセージが表示される", async () => {
      const idInput = screen.getByLabelText(/SteamアプリID/i);
      const submitButton = screen.getByRole("button", {
        name: "Steamゲームを追加",
      });

      fireEvent.change(idInput, { target: { value: "abc" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // typeErrorメッセージを確認
        expect(
          screen.getByText("IDは数値である必要があります"),
        ).toBeInTheDocument();
      });
      // トップレベルでインポートしたモック関数を使用
      expect(addStoredSteamGame).not.toHaveBeenCalled();
    });
  });

  // --- カスタムゲーム追加のテスト ---
  describe("カスタムゲーム追加", () => {
    beforeEach(async () => {
      renderWithClient(<AddGameModal />);
      fireEvent.click(screen.getByRole("button", { name: /ゲームを追加/i }));
      // モーダルが開くまで待機
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
        ).toBeInTheDocument();
      });
      // カスタムタブに切り替え
      const customTab = screen.getByRole("tab", {
        name: /カスタムゲームを追加/i,
      });
      fireEvent.click(customTab);
      await waitFor(() => {
        expect(screen.getByLabelText(/ゲーム名/i)).toBeInTheDocument();
      });
    });

    it("有効なカスタムゲーム情報を入力して送信するとaddStoredCustomGameが呼ばれる", async () => {
      // トップレベルでインポートしたモック関数を使用
      const nameInput = screen.getByLabelText(/ゲーム名/i);
      const urlInput = screen.getByLabelText(/アイコン画像のURL/i);
      const playersInput = screen.getByLabelText(/プレイヤー数/i); // プレイヤー数入力
      const submitButton = screen.getByRole("button", {
        name: "カスタムゲームを追加",
      });

      fireEvent.change(nameInput, { target: { value: "テストゲーム" } });
      fireEvent.change(urlInput, {
        target: { value: "http://example.com/icon.png" },
      });
      fireEvent.change(playersInput, { target: { value: "4" } }); // プレイヤー数を入力
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addStoredCustomGame).toHaveBeenCalledTimes(1);
        // addStoredCustomGameが正しい引数で呼ばれたか確認
        expect(addStoredCustomGame).toHaveBeenCalledWith(
          "テストゲーム",
          "http://example.com/icon.png",
          4,
        ); // players: 4 を期待
      });

      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(
          screen.queryByRole("tab", { name: /カスタムゲームを追加/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("無効なカスタムゲーム情報（空の名前）を入力して送信するとエラーメッセージが表示される", async () => {
      const urlInput = screen.getByLabelText(/アイコン画像のURL/i);
      const playersInput = screen.getByLabelText(/プレイヤー数/i);
      const submitButton = screen.getByRole("button", {
        name: "カスタムゲームを追加",
      });

      fireEvent.change(urlInput, {
        target: { value: "http://example.com/icon.png" },
      });
      fireEvent.change(playersInput, { target: { value: "2" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("name is a required field"),
        ).toBeInTheDocument();
      });
      // トップレベルでインポートしたモック関数を使用
      expect(addStoredCustomGame).not.toHaveBeenCalled();
    });

    it("無効なカスタムゲーム情報（無効なURL）を入力して送信するとエラーメッセージが表示される", async () => {
      const nameInput = screen.getByLabelText(/ゲーム名/i);
      const urlInput = screen.getByLabelText(/アイコン画像のURL/i);
      const playersInput = screen.getByLabelText(/プレイヤー数/i);
      const submitButton = screen.getByRole("button", {
        name: "カスタムゲームを追加",
      });

      fireEvent.change(nameInput, { target: { value: "テストゲーム" } });
      fireEvent.change(urlInput, { target: { value: "invalid-url" } });
      fireEvent.change(playersInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("有効なURLである必要があります"),
        ).toBeInTheDocument();
      });
      // トップレベルでインポートしたモック関数を使用
      expect(addStoredCustomGame).not.toHaveBeenCalled();
    });

    it("無効なカスタムゲーム情報（無効なプレイヤー数）を入力して送信するとエラーメッセージが表示される", async () => {
      const nameInput = screen.getByLabelText(/ゲーム名/i);
      const urlInput = screen.getByLabelText(/アイコン画像のURL/i);
      const playersInput = screen.getByLabelText(/プレイヤー数/i);
      const submitButton = screen.getByRole("button", {
        name: "カスタムゲームを追加",
      });

      fireEvent.change(nameInput, { target: { value: "テストゲーム" } });
      fireEvent.change(urlInput, {
        target: { value: "http://example.com/icon.png" },
      });
      fireEvent.change(playersInput, { target: { value: "0" } }); // 無効なプレイヤー数
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("プレイヤー数は1以上である必要があります"),
        ).toBeInTheDocument();
      });
      // トップレベルでインポートしたモック関数を使用
      expect(addStoredCustomGame).not.toHaveBeenCalled();
    });
  });

  it("モーダルの閉じるボタン（背景クリック）でモーダルが閉じる", async () => {
    renderWithClient(<AddGameModal />);
    fireEvent.click(screen.getByRole("button", { name: /ゲームを追加/i }));

    // モーダルが開いたことを確認
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
      ).toBeInTheDocument();
    });

    // Escapeキーで閉じるテスト
    fireEvent.keyDown(screen.getByRole("presentation"), {
      key: "Escape",
      code: "Escape",
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("tab", { name: /Steamゲームを追加 \(ID\)/i }),
      ).not.toBeInTheDocument();
    });
  });
});
