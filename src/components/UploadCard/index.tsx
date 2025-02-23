import { Flex, Typography, theme } from "antd";
import style from "./index.module.scss";
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { gstate } from "@/global";
import { ImageInput } from "../ImageInput";
import { state } from "./state";
import { toJS } from "mobx";
import { FileListLike, createImageList } from "@/libs/transform";

function useDragAndDrop(dragRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const dragLeave = () => {
      state.dragActive = false;
    };
    const dragOver = (event: DragEvent) => {
      event.preventDefault();
      state.dragActive = true;
    };
    const drop = async (event: DragEvent) => {
      event.preventDefault();
      state.dragActive = false;

      let files: FileListLike = [];
      if (event.dataTransfer?.items) {
        const list: File[] = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
          const item = event.dataTransfer.items[i];
          const types = Object.values(toJS(gstate.mimes));
          if (item.kind === "file" && types.includes(item.type)) {
            const file = item.getAsFile();
            if (file) {
              list.push(file);
            }
          }
        }
        files = list;
      } else if (event.dataTransfer?.files) {
        files = event.dataTransfer?.files;
      }

      if (files.length) {
        await createImageList(files);
      }
    };

    const target = dragRef.current!;
    target.addEventListener("dragover", dragOver);
    target.addEventListener("dragleave", dragLeave);
    target.addEventListener("drop", drop);

    return () => {
      target.removeEventListener("dragover", dragOver);
      target.removeEventListener("dragleave", dragLeave);
      target.removeEventListener("drop", drop);
    };
  }, []);
}

export const UploadCard = observer(() => {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useDragAndDrop(dragRef);

  const { token } = theme.useToken();

  return (
    <Flex
      justify="center"
      align="center"
      className={classNames(style.container, state.dragActive && style.active)}
      style={{ borderRadius: token.borderRadiusLG }}
    >
      <Flex vertical align="center" className={style.inner}>
        <svg viewBox="0 0 24 24">
          <path d="M18 15V18H15V20H18V23H20V20H23V18H20V15H18M13.3 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V13.3C20.4 13.1 19.7 13 19 13C17.9 13 16.8 13.3 15.9 13.9L14.5 12L11 16.5L8.5 13.5L5 18H13.1C13 18.3 13 18.7 13 19C13 19.7 13.1 20.4 13.3 21Z" />
        </svg>
        <Typography.Text>{gstate.locale?.uploadCard.title}</Typography.Text>
        <div>
          {gstate.locale?.uploadCard.subTitle[0]}&nbsp;
          <span>
            {Object.keys(toJS(gstate.mimes))
              .map((item) => item.toUpperCase())
              .join("/")}
          </span>
          &nbsp;{gstate.locale?.uploadCard.subTitle[1]}
        </div>
      </Flex>
      <ImageInput ref={fileRef} />
      <div
        className={style.mask}
        ref={dragRef}
        onClick={() => {
          fileRef.current?.click();
        }}
      />
    </Flex>
  );
});
