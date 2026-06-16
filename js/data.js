import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc6l3nVqTq_rc6gfGgAdV0EfAQANyeDxk",
  authDomain: "active-maths-championship.firebaseapp.com",
  projectId: "active-maths-championship",
  storageBucket: "active-maths-championship.firebasestorage.app",
  messagingSenderId: "477055306131",
  appId: "1:477055306131:web:a013077e226defc6300066",
  measurementId: "G-2DX3TEDZP1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, signOut };

export const SCHOOLS = [
    "Ameghino", "Amundsen", "Biró", "Chesterton", "Dickens",
    "Gaudi", "Ikastola", "Marie Curie", "Molisano",
    "Nuestra Señora del Carmen", "Nuestra Señora del Huerto",
    "Shackleton", "Stevenson", "Tesla", "Tolkien"
];

export const CATEGORIES = [
    { id: "basico",     name: "Básico (7N y 8N)" },
    { id: "intermedio", name: "Intermedio (9N y 10N)" },
    { id: "avanzado",   name: "Avanzado (11N y 12N)" },
    { id: "pitagoras",  name: "Pitágoras" }
];

// "pitagoras" reutiliza el banco de preguntas de "basico" (sin mostrar el motivo al estudiante)
export const CATEGORY_BASE_MAP = {
    "pitagoras": "basico"
};

export const QUESTIONS_DB = {
    "basico": [
        {
            id: "b1",
            text: "Problema 1: El rectángulo de la figura está dividido en cuatro rectángulos más pequeños mediante dos líneas paralelas a sus lados. En tres de ellos se ha escrito el perímetro correspondiente (1, 2, 2). ¿Cuál es el perímetro del cuarto rectángulo?",
            correctAnswer: "3"
        },
        {
            id: "b2",
            text: "Problema 3: Reemplazando x e y por dígitos, hallar todos los números naturales de cinco cifras 65x1y que son múltiplos de doce.",
            correctAnswer: "65016, 65316, 65616, 65916"
        },
        {
            id: "b3",
            text: "Problema 8: Hallar todos los números de cuatro cifras 1a7b que son múltiplos de 15. (a y b son dígitos no necesariamente distintos.)",
            correctAnswer: "1070, 1370, 1670, 1970"
        },
        {
            id: "b4",
            text: "Problema 10: Al sumar el número de cuatro dígitos ABCD más el número de tres dígitos BCD más el número de dos dígitos CD más el número de un dígito D el resultado es 2000. Hallar los dígitos A, B, C y D, si cada letra representa un dígito distinto.",
            correctAnswer: "A=1, B=9, C=8, D=5"
        }
    ],
    "intermedio": [
        {
            id: "i1",
            text: "Problema 1: El promedio de 16 números es igual a 168. Se modifican los números: a los primeros 8 se les resta 3 y a los últimos 8 se les suma 10. Determinar el promedio de los 16 números obtenidos.",
            correctAnswer: "171.5"
        },
        {
            id: "i2",
            text: "Problema 3: Determinar cuántos números enteros entre 1 y 2026 inclusive no contienen el dígito 1.",
            correctAnswer: "1480"
        },
        {
            id: "i3",
            text: "Problema 5: Ariel dibujó un triángulo. Bruno dibujó otro triángulo cuya base es 10% mayor y altura 10% menor. Determinar a qué porcentaje del área del triángulo de Ariel es igual el área del triángulo de Bruno.",
            correctAnswer: "99%"
        },
        {
            id: "i4",
            text: "Problema 8: Hallar todos los tríos (p, q, r) de números primos, con q menor que r, que satisfacen p × (q + r) = 215. Considerar p, q, r positivos.",
            correctAnswer: "(5, 2, 41)"
        }
    ],
    "avanzado": [
        {
            id: "a1",
            text: "Problema 1: Sea N = 36^x − 5^y, con x e y enteros positivos. Entre todos los valores positivos de N, determinar el menor posible.",
            correctAnswer: "11"
        },
        {
            id: "a2",
            text: "Problema 2: En el triángulo ABC rectángulo en A, la perpendicular a BC trazada desde A corta a BC en D de modo que BD = 3 y CD = 12. Calcular el área del triángulo ABC.",
            correctAnswer: "45"
        },
        {
            id: "a3",
            text: "Problema 8: Hallar la cantidad de enteros n tales que: 2000 < n < 7000, n es múltiplo de 2 y los dígitos de n son todos diferentes.",
            correctAnswer: "1400"
        },
        {
            id: "a4",
            text: "Problema 10: Escribir en cada casilla uno de los números 35; 40; 44; 46; 55 sin repetir, para que el promedio de los dos primeros sea entero, el de los tres primeros sea entero y el de los cuatro primeros sea entero.",
            correctAnswer: "55, 35, 46, 44, 40"
        }
    ]
};

QUESTIONS_DB["pitagoras"] = QUESTIONS_DB["basico"];

export const DB = {
    saveUser: async (uid, userData) => {
        await setDoc(doc(db, "users", uid), userData);
    },
    getUser: async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data() : null;
    },
    saveExamState: async (uid, state) => {
        await setDoc(doc(db, "exam_states", uid), state);
    },
    getExamState: async (uid) => {
        const snap = await getDoc(doc(db, "exam_states", uid));
        return snap.exists() ? snap.data() : null;
    },
    saveSubmission: async (uid, submission) => {
        await setDoc(doc(db, "submissions", uid), submission);
        await setDoc(doc(db, "exam_states", uid), { finished: true });
    },
    updateSubmission: async (uid, data) => {
        await setDoc(doc(db, "submissions", uid), data, { merge: true });
    },
    getSubmissions: async () => {
        const snap = await getDocs(collection(db, "submissions"));
        const subs = [];
        snap.forEach(d => subs.push({ _docId: d.id, ...d.data() }));
        return subs;
    },
    // Para el examen del estudiante: solo enunciado, NUNCA la respuesta correcta.
    // La clave de respuestas vive en una colección separada (answer_keys) que las
    // reglas de Firestore solo dejan leer al admin, así un estudiante no puede
    // verla por la consola del navegador ni por la pestaña Network.
    getQuestions: async (category) => {
        const baseCategory = CATEGORY_BASE_MAP[category] || category;
        try {
            const snap = await getDoc(doc(db, "questions", baseCategory));
            if (snap.exists() && snap.data().questions?.length > 0) {
                return snap.data().questions;
            }
        } catch (_) { /* network error or permission denied: use defaults */ }
        return (QUESTIONS_DB[category] || []).map(({ id, text, imageUrl }) => ({ id, text, imageUrl }));
    },
    // Solo para el admin: enunciado + respuesta correcta combinados, para editar y corregir.
    getQuestionsFull: async (category) => {
        const baseCategory = CATEGORY_BASE_MAP[category] || category;
        let qs = null, answers = null;
        try {
            const qSnap = await getDoc(doc(db, "questions", baseCategory));
            if (qSnap.exists() && qSnap.data().questions?.length > 0) qs = qSnap.data().questions;
        } catch (_) { /* usar default */ }
        try {
            const aSnap = await getDoc(doc(db, "answer_keys", baseCategory));
            if (aSnap.exists()) answers = aSnap.data().answers || {};
        } catch (_) { /* usar default */ }

        const fallback = QUESTIONS_DB[category] || [];
        if (!qs) qs = fallback.map(({ id, text, imageUrl }) => ({ id, text, imageUrl }));
        if (!answers) answers = Object.fromEntries(fallback.map(q => [q.id, q.correctAnswer]));

        return qs.map(q => ({ ...q, correctAnswer: answers[q.id] ?? '' }));
    },
    // Solo para el admin: separa enunciado y respuesta antes de guardar en las dos colecciones.
    saveQuestionsFull: async (category, questions) => {
        const qs      = questions.map(({ id, text, imageUrl }) => ({ id, text, ...(imageUrl ? { imageUrl } : {}) }));
        const answers = {};
        questions.forEach(q => { answers[q.id] = q.correctAnswer; });
        const updatedAt = new Date().toISOString();
        await setDoc(doc(db, "questions", category), { questions: qs, updatedAt });
        await setDoc(doc(db, "answer_keys", category), { answers, updatedAt });
    },
    deleteSubmission: async (uid) => {
        await deleteDoc(doc(db, "submissions", uid));
        await deleteDoc(doc(db, "exam_states", uid));
    },
    getConfig: async () => {
        try {
            const snap = await getDoc(doc(db, "config", "settings"));
            return snap.exists() ? snap.data() : { examDurationMinutes: 80 };
        } catch (_) {
            return { examDurationMinutes: 80 };
        }
    },
    saveConfig: async (config) => {
        await setDoc(doc(db, "config", "settings"), {
            ...config,
            updatedAt: new Date().toISOString()
        });
    }
};
