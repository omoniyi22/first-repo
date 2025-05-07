
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import MediaSelector from "../../media/MediaSelector";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { blogPostFormSchema } from "./blogFormSchema";

type FormData = z.infer<typeof blogPostFormSchema>;

interface FeaturedImageFieldProps {
  form: UseFormReturn<FormData>;
}

const FeaturedImageField = ({ form }: FeaturedImageFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Featured Image</FormLabel>
          <FormControl>
            <MediaSelector
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FeaturedImageField;
