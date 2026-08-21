import react from 'react';
import Button from './Button';
import logo from '../assets/logo.png'

const Header = ()=>{
    return (
        <div className='absolute z-100 w-full px-12 py-6 flex justify-evenly items-center bg-transparent'>
            <div className="logo flex justify-center items-center text-gray-200 text-[1.3rem]">
                <img src={logo} alt="logo" className='w-9 md:w-12 lg:w-15 -m-3  h-auto'/>
                <span>Etrics</span>
            </div>
            <div className="navlinks">
                <ul className='flex justify-center items-center gap-3 md:gap-6 lg:gap-9 text-[0.5rem] md:text-[1rem] lg:text-[1.2rem] text-gray-300 '>
                    <li>Home</li>
                    <li>Teams</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>
            </div>
            <div className='authBtns flex gap-6 lg:gap-9'>
                <Button title='signin' type='white'/>
                <Button title="signUp" type='outline'/>
            </div>
        </div>
    )
}

export default Header;
