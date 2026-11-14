---
title: What the spectral theorem actually says
date: 2026-11-14
summary: A first post, and a plain-language statement of the theorem this site's background is quietly drawing.
---

This blog is a monthly notebook: one post a month on spectral theory and whatever I'm building. Short is fine. Consistent is the point.

## The formulas behind the page

The formulas that fade in and out behind this site are all statements from spectral theory. This first post unpacks the one that everything else hangs on.

## The theorem, in one line

For a compact self-adjoint operator $T$ on a Hilbert space $H$, there is an orthonormal basis of eigenvectors $e_n$ with real eigenvalues $\lambda_n \to 0$, and

$$T x = \sum_n \lambda_n \langle x, e_n\rangle\, e_n .$$

In words: a self-adjoint operator is just "stretch by $\lambda_n$ along $e_n$", once you choose the right axes. Finite-dimensional symmetric matrices are the case you already know.

## Beyond compactness

Compactness is a luxury. For a general self-adjoint operator the sum becomes an integral against a projection-valued measure $E$ supported on the spectrum:

$$T = \int_{\sigma(T)} \lambda \, dE(\lambda).$$

That one formula is what lets you define $\phi(T)$ for any reasonable function $\phi$, including $e^{-tT}$, the heat semigroup. It is also the doorway to the question I find most beautiful: how much of a shape can you read off its spectrum?

*Next month: something concrete, probably Weyl's law with a worked example.*
