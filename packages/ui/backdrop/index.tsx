import React from "react";
import classes from "./Backdrop.module.scss";

interface Props {
	open: boolean;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}
export default function Backdrop(props: Props) {
	if (!props.open) return null;

	return <div className={classes.backdrop} onClick={props.onClick} />;
}
