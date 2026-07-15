import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const StorySection = ({
  description,
  setDescription,
}) => {
  return (
    <div className="space-y-4">

      <div>

        <h2 className="text-xl font-bold">
          Tell Your Story
        </h2>

        <p className="text-xs opacity-70">
          Tell attendees why they should come.
        </p>

      </div>

      <ReactQuill
        theme="snow"
        value={description}
        onChange={setDescription}
        modules={modules}
        placeholder="Write your event story..."
      />

    </div>
  );
};

export default StorySection;