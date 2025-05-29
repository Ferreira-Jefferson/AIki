import Image from "next/image";
import styles from "./ChangeButton.module.css";
import { useState } from "react";

const ChangeButton = (props: any) => {
	const [status, setStatus] = useState('disabled');

	const handleClick = () => {
		setStatus(status == "disabled" ? "enabled" : "disabled");
		return props.onClick
	}
  return (
    <button className={styles.changeButton}>
      <Image src="/change-side.png" alt="Change" width={50} height={50} className={styles[status]} onClick={handleClick} />
    </button>
  );
};

export default ChangeButton;
