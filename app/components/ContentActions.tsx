import { Button } from "@mantine/core";
import { Form } from "react-router";
import type { BarkNode } from "~/routes/content-library.$";

interface ContentActionsProps {
  parentNode: BarkNode;
}

export default function ContentActions({ parentNode }: ContentActionsProps) {
  return (
    <div className="flex gap-4 m-4">
      <Form method="post" encType="multipart/form-data">
        <input type="hidden" name="parentId" value={parentNode.id} />
        <input type="hidden" name="displayPath" value={parentNode.displayPath} />
        <input type="hidden" name="intent" value="" />

        <div className="flex gap-4">
          <Button
            type="submit"
            onClick={(e) => {
              const form = e.currentTarget.form;
              const intentInput = form?.querySelector('input[name="intent"]') as HTMLInputElement;
              if (intentInput) intentInput.value = 'create-folder';
            }}
          >
            Create Folder
          </Button>

          <input
            type="file"
            name="file"
            className="file:py-2 file:px-4 file:rounded-md file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const form = e.target.form;
                const intentInput = form?.querySelector('input[name="intent"]') as HTMLInputElement;
                if (intentInput) intentInput.value = 'upload-file';
                form?.requestSubmit();
              }
            }}
          />
        </div>
      </Form>
    </div>
  );
}
