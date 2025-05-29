import Image from "next/image";
import styles from "./ChangeButton.module.css";

const ChangeButton = (props: any) => {

  return (
    <button className={styles.changeButton}>
      <Image src="/change-side.png" alt="Change" width={50} height={50} className={props.activeChange ? styles.enabled : ""} onClick={props.handleChange} />
    </button>
  );
};

export default ChangeButton;
