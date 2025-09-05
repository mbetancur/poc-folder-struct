import { Form } from "react-router";

interface UploadFileFormProps {
  folderId?: string;
}

export function UploadFileForm({ folderId, }: UploadFileFormProps) {
  return (
    <div className="float-right bg-gray-500 p-4">
      <h3>Upload File</h3>

      <Form method="post" encType="multipart/form-data">
        <input type="hidden" name="intent" value="uploadFile" />
        {folderId && <input type="hidden" name="folderId" value={folderId} />}

        <div>
          <label htmlFor="file">
            Select File:
          </label>
          <input
            type="file"
            name="file"
            id="file"
            required
          />
        </div>

        <div>
          <button type="submit">
            Upload File
          </button>


        </div>
      </Form>
    </div>
  );
}
