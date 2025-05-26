from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__, static_url_path='/static')
app.secret_key = 'tu_clave_secreta_aqui'  # Cambia esto por una clave segura en producción

# Configuración de PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://root:qrWhtsvFcdn1PQVGdidhhKgUlYpowuQQ@dpg-d0h0qk24d50c738b3p4g-a.oregon-postgres.render.com:5432/app_kmb9'
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {
        "sslmode": "require"
    }
}

db = SQLAlchemy(app)

# Configuración de Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Modelos de la base de datos
class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))  # Aumentado a 256 caracteres

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

# Cargador de usuario para Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Crear tablas y usuario admin inicial (solo en primera ejecución)
with app.app_context():
    db.create_all()
    if not Usuario.query.filter_by(username='admin').first():
        admin = Usuario(username='admin')
        admin.set_password('admin123')  # Cambia esto en producción
        db.session.add(admin)
        db.session.commit()

# Rutas de autenticación
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = Usuario.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            flash('¡Bienvenido!', 'success')
            return redirect(url_for('index'))
        flash('Usuario o contraseña incorrectos', 'danger')

    return render_template('login.html', titulo="Iniciar Sesión")

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Has cerrado sesión correctamente', 'info')
    return redirect(url_for('login'))

# Rutas principales (protegidas)
@app.route('/')
@login_required
def index():
    reservas = Reserva.query.order_by(Reserva.fecha, Reserva.hora_inicio).all()
    return render_template('index.html', reservas=reservas, titulo="Inicio")

@app.route("/agregar", methods=["GET", "POST"])
def agregar():
    if request.method == "POST":
        estudiante_id = request.form["estudiante_id"]
        fecha_str = request.form["fecha"]
        hora_inicio_str = request.form["hora_inicio"]
        hora_fin_str = request.form["hora_fin"]

        # Convertir strings a objetos de fecha y hora
        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            hora_inicio = datetime.strptime(hora_inicio_str, "%H:%M").time()
            hora_fin = datetime.strptime(hora_fin_str, "%H:%M").time()
        except ValueError:
            flash("Formato de fecha u hora inválido.", "danger")
            return redirect(url_for("agregar"))

        # Validar que hora_inicio sea menor que hora_fin
        if hora_inicio >= hora_fin:
            flash("La hora de inicio debe ser menor que la hora de fin.", "danger")
            return redirect(url_for("agregar"))

        # Verificar conflicto de horario en la misma fecha
        conflicto = Reserva.query.filter_by(fecha=fecha).filter(
            Reserva.hora_inicio < hora_fin,
            Reserva.hora_fin > hora_inicio
        ).first()

        if conflicto:
            flash("Ya existe una reserva que se cruza con ese horario.", "danger")
            return redirect(url_for("agregar"))

        # Crear y guardar la nueva reserva
        nueva_reserva = Reserva(
            estudiante_id=estudiante_id,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin
        )
        db.session.add(nueva_reserva)
        db.session.commit()

        flash("Reserva creada exitosamente.", "success")
        return redirect(url_for("index"))

    return render_template("agregar.html")

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar(id):
    reserva = Reserva.query.get_or_404(id)
    if request.method == 'POST':
        try:
            reserva.estudiante_id = request.form['estudiante_id']
            reserva.fecha = datetime.strptime(request.form['fecha'], '%Y-%m-%d').date()
            reserva.hora_inicio = datetime.strptime(request.form['hora_inicio'], '%H:%M').time()
            reserva.hora_fin = datetime.strptime(request.form['hora_fin'], '%H:%M').time()
            db.session.commit()
            flash('Reserva actualizada!', 'success')
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('index'))

    fecha_str = reserva.fecha.strftime('%Y-%m-%d')
    hora_inicio_str = reserva.hora_inicio.strftime('%H:%M')
    hora_fin_str = reserva.hora_fin.strftime('%H:%M')
    return render_template('editar.html', reserva=reserva, fecha_str=fecha_str,
                         hora_inicio_str=hora_inicio_str, hora_fin_str=hora_fin_str, titulo="Editar Reserva")

@app.route('/eliminar/<int:id>')
@login_required
def eliminar(id):
    reserva = Reserva.query.get_or_404(id)
    db.session.delete(reserva)
    db.session.commit()
    flash('Reserva eliminada!', 'warning')
    return redirect(url_for('index'))

@app.route('/buscar')
@login_required
def buscar():
    query = request.args.get('q', '')
    reservas = Reserva.query.filter(Reserva.estudiante_id.contains(query)).all() if query else Reserva.query.all()
    return render_template('index.html', reservas=reservas, titulo="Resultados de Búsqueda")

# Ruta pagina register     
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Verifica si el usuario ya existe
        existing_user = Usuario.query.filter_by(username=username).first()
        if existing_user:
            flash('El nombre de usuario ya está en uso', 'danger')
            return redirect(url_for('register'))

        # Crear nuevo usuario
        nuevo_usuario = Usuario(username=username)
        nuevo_usuario.set_password(password)

        db.session.add(nuevo_usuario)
        db.session.commit()

        flash('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


# Ruta de landing page (pública)
@app.route('/landing')
def landing():
    return render_template('landing.html', titulo="Sistema de Reservas Xbox")

if __name__ == '__main__':
    app.run(debug=True)
    
