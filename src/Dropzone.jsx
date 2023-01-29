import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { styled, Typography } from "@mui/material";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 120,
  padding: 4,
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const RemoveDiv = styled("div")({
  position: "relative", // this is needed for the overlay to be positioned correctly
  "&:hover::after": {
    content: '"Remove"',
    cursor: "pointer",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)", // this sets the background color and opacity of the overlay
    color: "white", // this sets the text color of the "Remove" text
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1em",
  },
});
export function Dropzone(props) {
  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "application/pdf": [],
      },
      onDrop: (acceptedFiles) => {
        updateFiles([...files, ...acceptedFiles]);
      },
    });
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  function updateFiles(files) {
    setFiles(files);
    props.onChange(files);
  }

  const thumbs = files.map((file) => (
    <div
      style={thumb}
      key={file.name}
      onClick={() => updateFiles(files.filter((o) => o !== file))}
    >
      <div style={thumbInner}>
        <RemoveDiv>
          <Typography variant="subtitle2">{file.name}</Typography>
        </RemoveDiv>
      </div>
    </div>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </section>
  );
}
