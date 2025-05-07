
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { blogPostFormSchema } from "./blogFormSchema";

type FormData = z.infer<typeof blogPostFormSchema>;

interface BasicInfoFieldsProps {
  form: UseFormReturn<FormData>;
  generateSlug: () => void;
}

const BasicInfoFields = ({ form, generateSlug }: BasicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter blog post title" 
                {...field}
                onBlur={() => {
                  field.onBlur();
                  if (!form.getValues("slug")) {
                    generateSlug();
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Slug
              <Button 
                type="button" 
                variant="link" 
                className="h-auto p-0 ml-2" 
                onClick={generateSlug}
              >
                Generate from title
              </Button>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter URL slug" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoFields;
