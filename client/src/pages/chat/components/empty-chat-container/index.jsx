import Lottie from "react-lottie";
import {animationDefaultOptions} from "@/lib/utils";

const EmptyContainer = () => {

    return (

<div className="flex-1 w-[100vw] sm:w-[50vw] md:w-[50vw] sm:bg-[#1c1d25] sm:flex flex-col justify-center items-center hidden duration-1000 transition-all">
    <Lottie 
    isClickToPauseDisabled={true}
    height={200}
    width={200}
    options={animationDefaultOptions}
    />

    <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text text-3xl transition-all duration-300 text-center">
    <h3 className="poppins-medium">
        Hi<span className="text-purple-500 font-medium">!</span> Welcome to 
        <span className="text-purple-500 font-medium"> Calypso </span> Chat App
        <span className="text-purple-500 font-medium">!</span>
    </h3>
    </div>

    </div>

)};

export default EmptyContainer;