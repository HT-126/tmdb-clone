import { MutationObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "./queryClient";

const user = { id: 1, email: "me@example.com" };

function failure(status) {
  return Object.assign(new Error(`failed ${status}`), { status });
}

describe("queryClient", () => {
  it("forgets the logged-in user when a query gets 401", async () => {
    const client = createQueryClient();
    client.setQueryData(["me"], user);

    await client
      .fetchQuery({
        queryKey: ["favorites"],
        queryFn: () => Promise.reject(failure(401)),
        retry: false,
      })
      .catch(() => {});

    expect(client.getQueryData(["me"])).toBeNull();
  });

  it("forgets the logged-in user when a mutation gets 401", async () => {
    const client = createQueryClient();
    client.setQueryData(["me"], user);

    await new MutationObserver(client, {
      mutationFn: () => Promise.reject(failure(401)),
    })
      .mutate()
      .catch(() => {});

    expect(client.getQueryData(["me"])).toBeNull();
  });

  it("keeps the user for other errors (404, 500)", async () => {
    const client = createQueryClient();
    client.setQueryData(["me"], user);

    for (const status of [404, 500]) {
      await client
        .fetchQuery({
          queryKey: ["movie", status],
          queryFn: () => Promise.reject(failure(status)),
          retry: false,
        })
        .catch(() => {});
    }

    expect(client.getQueryData(["me"])).toEqual(user);
  });

  it("does not retry 4xx errors but retries other errors twice", () => {
    const { retry } = createQueryClient().getDefaultOptions().queries;

    expect(retry(0, failure(404))).toBe(false);
    expect(retry(0, failure(401))).toBe(false);
    expect(retry(0, failure(500))).toBe(true);
    expect(retry(2, failure(500))).toBe(false);
  });
});
