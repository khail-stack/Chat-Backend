const { response } = require("express")
const bcrypt = require("bcryptjs")
const Usuario = require("../models/usuario")
const { generarJWT } = require("../helpers/jwt")

const crearUsuario = async (req, res = response) => {
    
    try {

        const { email, password } = req.body

        // Verificar que el email no exista
        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya existe'
            });
        }

        const usuario = new Usuario(req.body);

        // TODO: Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        
        //Guardar usuario en BD
        await usuario.save();

        // Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        })
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}



const login =  async(req, res) => {

    const { email, password } = req.body;
    
    try {

        const usuarioDB = await Usuario.findOne({ email });
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        const validarPassword = bcrypt.compareSync(password, usuarioDB.password)
        if (!validarPassword) {

            return res.status(404).json({
                ok: false,
                msg: 'Password no es correcto'
            });
            
        }

        const token = await generarJWT(usuarioDB._id);   

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
        
    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });

    }

    res.json({
        ok: true,
        msg: 'login',
        email,
        password
    })
}



const revalidarToken = async (req, res) => {
    
    const uid = req.uid;

    // Genrar un nuevo JWT
    const token = await generarJWT(uid);

    // Obtener el usuario por UID
    const usuario = await Usuario.findById(uid);

    res.json({
        ok: true,
        usuario,
        token
    })
}

module.exports = {
    crearUsuario,
    login,
    revalidarToken
}