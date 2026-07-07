import { ChangeEvent } from "react";

type InptutFields = {
    type : string;
    placeHolder: string;
    style: string;
    autoComplete?: string
    value : string
    onChange: (e : ChangeEvent<HTMLInputElement>) => void;

}



function Input({type, placeHolder, style, autoComplete, value, onChange} : InptutFields){

    return (
        <input className={style}
        placeholder={placeHolder}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}/>
    )
}



export default Input
