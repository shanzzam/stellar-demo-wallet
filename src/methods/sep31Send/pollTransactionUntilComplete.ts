import { log } from "helpers/log";

export const pollTransactionUntilComplete = async ({
  sendServer,
  transactionId,
  token,
}: {
  sendServer: string;
  transactionId: string;
  token: string;
}) => {
  log.instruction({
    title:
      "Poll /transactions/:id endpoint until transaction status reaches end status",
  });

  let currentStatus;
  let resultJson;

  log.request({ title: `GET /transactions/${transactionId}` });

  while (!["pending_external", "completed", "error"].includes(currentStatus)) {
    // eslint-disable-next-line no-await-in-loop
    const result = await fetch(`${sendServer}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.status !== 200) {
      throw new Error(
        `GET /transactions/${transactionId} responded with status ${result.status}`,
      );
    }

    // eslint-disable-next-line no-await-in-loop
    resultJson = await result.json();

    if (currentStatus !== resultJson.transaction.status) {
      currentStatus = resultJson.transaction.status;

      log.instruction({
        title: `Transaction ${transactionId} is in ${resultJson.transaction.status} status`,
      });

      switch (currentStatus) {
        case "pending_sender":
          log.instruction({
            title: "Awaiting payment to be initiated by sending anchor",
          });
          break;
        case "pending_stellar":
          log.instruction({
            title:
              "Transaction has been submitted to Stellar network, but is not yet confirmed",
          });
          break;
        case "pending_customer_info_update":
          log.instruction({
            title:
              "Certain pieces of information need to be updated by the sending anchor",
          });
          break;
        case "pending_transaction_info_update":
          log.instruction({
            title:
              "Certain pieces of information need to be updated by the sending anchor",
          });
          break;
        case "pending_receiver":
          log.instruction({
            title: "Payment is being processed by the receiving anchor",
          });
          break;
        default:
        // do nothing
      }
    }

    // run loop every 2 seconds
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!resultJson) {
    throw new Error("Something went wrong, there was no response");
  }

  log.response({
    title: `GET /transactions/${transactionId}`,
    body: resultJson,
  });
};