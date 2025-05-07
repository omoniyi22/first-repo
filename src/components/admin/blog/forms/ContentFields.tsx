
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "../RichTextEditor";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { blogPostFormSchema } from "./blogFormSchema";

type FormData = z.infer<typeof blogPostFormSchema>;

interface ContentFieldsProps {
  form: UseFormReturn<FormData>;
}

const ContentFields = ({ form }: ContentFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter a short excerpt" 
                className="resize-none h-20" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <RichTextEditor 
                value={field.value || ''} 
                onChange={field.onChange} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContentFields;
