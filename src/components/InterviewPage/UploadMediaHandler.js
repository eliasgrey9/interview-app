import { MediaChunksHandler } from "./MediaChunksHandler";
import { useEffect, useState } from "react";
export default function ScreenRecorderTest(props) {
  const { file, fileName } = props;

  const [uploader, setUploader] = useState(undefined);

  useEffect(() => {
    if (file) {
      let percentage = undefined;

      const videoUploaderOptions = {
        fileName: fileName,
        file: file,
      };

      const uploader = new MediaChunksHandler(videoUploaderOptions);
      setUploader(uploader);

      uploader
        .onProgress(({ percentage: newPercentage }) => {
          // to avoid the same percentage to be logged twice
          if (newPercentage !== percentage) {
            percentage = newPercentage;
            console.log(`${percentage}%`);
          }
        })
        .onError((error) => {
          console.error(error);
        });

      uploader.start();
    }
  }, [file]);

  return null;
}