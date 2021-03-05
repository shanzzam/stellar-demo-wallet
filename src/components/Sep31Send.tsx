import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Heading2, Heading3, Input } from "@stellar/design-system";
import { Modal } from "components/Modal";
import { fetchAccountAction } from "ducks/account";
import { resetActiveAsset } from "ducks/activeAsset";
import {
  resetSep31SendAction,
  submitSep31SendTransactionAction,
} from "ducks/sep31Send";
import { capitalizeString } from "helpers/capitalizeString";
import { useRedux } from "hooks/useRedux";
import { ActionStatus } from "types/types.d";

export const Sep31Send = () => {
  const { account, sep31Send } = useRedux("account", "sep31Send");
  const [formData, setFormData] = useState<any>({});

  const dispatch = useDispatch();

  useEffect(() => {
    if (sep31Send.status === ActionStatus.SUCCESS) {
      if (account.data?.id) {
        dispatch(
          fetchAccountAction({
            publicKey: account.data.id,
            secretKey: account.secretKey,
          }),
        );
        dispatch(resetSep31SendAction());
      }
    }
  }, [sep31Send.status, account.data?.id, account.secretKey, dispatch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const [section, field] = id.split("#");

    const updatedState = {
      ...formData,
      [section]: {
        ...(formData[section] || {}),
        [field]: value,
      },
    };

    setFormData(updatedState);
  };

  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    dispatch(submitSep31SendTransactionAction({ ...formData }));
  };

  const handleClose = () => {
    dispatch(resetSep31SendAction());
    dispatch(resetActiveAsset());
  };

  if (sep31Send.status === ActionStatus.NEEDS_INPUT) {
    const { data } = sep31Send;
    const { transaction, sender, receiver } = data.fields;

    const allFields = {
      amount: {
        amount: {
          description: "amount to send",
        },
      },
      ...(sender ? { sender } : {}),
      ...(receiver ? { receiver } : {}),
      ...(transaction ? { transaction } : {}),
    };

    return (
      <Modal visible={true} onClose={handleClose}>
        <Heading2 className="ModalHeading">Collect Info</Heading2>

        <div className="ModalBody">
          {Object.entries(allFields).map(([sectionTitle, sectionItems]) => (
            <div className="vertical-spacing" key={sectionTitle}>
              <Heading3>{capitalizeString(sectionTitle)}</Heading3>
              {Object.entries(sectionItems).map(([id, input]) => (
                // TODO: if input.choices, render Select
                <Input
                  key={`${sectionTitle}#${id}`}
                  id={`${sectionTitle}#${id}`}
                  label={input.description}
                  required={!input.optional}
                  onChange={handleChange}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="ModalButtonsFooter">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </Modal>
    );
  }

  return null;
};