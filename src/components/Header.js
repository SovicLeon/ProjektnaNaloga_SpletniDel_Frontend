import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";
import './style.css';

function Header(props) {
    return (
        <header>
            <h1>{props.title}</h1>
            <nav>
                <ul>
                    <li><Link to='/'>Home</Link></li>
                    <UserContext.Consumer>
                        {context => (
                            context.user ?
                                <>
                                    <li><Link to='/profile'>Profile</Link></li>
                                    <li><Link to='/lastlocation'>Last location</Link></li>
                                    <li><Link to='/roadinfo'>Road info</Link></li>
                                    <li><Link to='/logout'>Logout</Link></li>
                                </>
                            :
                                <>
                                    <li><Link to='/roadinfo'>Road info</Link></li>
                                    <li><Link to='/login'>Login</Link></li>
                                    <li><Link to='/register'>Register</Link></li>
                                </>

                        )}
                    </UserContext.Consumer>
                </ul>
            </nav>
        </header >
    );
}

export default Header;