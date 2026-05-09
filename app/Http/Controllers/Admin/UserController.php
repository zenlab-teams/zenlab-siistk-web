<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 10);

        $allowedSorts = ['name', 'email', 'role', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->with(['sale:id,user_id,phone', 'customer:id,user_id,city'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('User/Create');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $data = $request->safe()->except(['phone', 'address', 'city', 'postal_code', 'password_confirmation']);
        $data['password'] = Hash::make($validated['password']);

        DB::transaction(function () use ($data, $validated): void {
            $user = User::query()->create($data);
            $this->syncRoleProfile($user, $validated, true);
        });

        return redirect()->route('user.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('User/Edit', [
            'user' => $user->load(['sale:id,user_id,phone', 'customer:id,user_id,address,city,postal_code']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if ($user->id === auth()->id() && $validated['role'] !== $user->role) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $data = $request->safe()->except(['phone', 'address', 'city', 'postal_code', 'password_confirmation']);
        if ($validated['password'] ?? false) {
            $data['password'] = Hash::make($validated['password']);
        } else {
            unset($data['password']);
        }

        DB::transaction(function () use ($user, $data, $validated): void {
            $user->update($data);
            $this->syncRoleProfile($user, $validated);
        });

        return redirect()->route('user.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        try {
            DB::transaction(function () use ($user): void {
                $user->sale()->delete();
                $user->customer()->delete();
                $user->delete();
            });
        } catch (QueryException $exception) {
            return back()->with('error', $this->deleteErrorMessage(false, $exception));
        }

        return redirect()->route('user.index')->with('success', 'User deleted successfully.');
    }

    public function destroySelected(string $ids): RedirectResponse
    {
        $userIds = array_values(array_filter(
            array_map('trim', explode(',', $ids)),
            static fn (string $id): bool => $id !== '' && ctype_digit($id)
        ));

        if ($userIds === []) {
            return back()->with('error', 'No users were selected for deletion.');
        }

        if (in_array((string) auth()->id(), $userIds, true)) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        try {
            $deletedCount = DB::transaction(static function () use ($userIds): int {
                $deletedCount = 0;

                User::query()
                    ->whereKey($userIds)
                    ->get()
                    ->each(static function (User $user) use (&$deletedCount): void {
                        $user->sale()->delete();
                        $user->customer()->delete();
                        if ($user->delete()) {
                            $deletedCount++;
                        }
                    });

                return $deletedCount;
            });
        } catch (QueryException $exception) {
            return back()->with('error', $this->deleteErrorMessage(true, $exception));
        }

        if ($deletedCount === 0) {
            return back()->with('error', 'No matching users were deleted.');
        }

        return redirect()->route('user.index')->with('success', 'Selected users deleted successfully.');
    }

    private function syncRoleProfile(User $user, array $validated, bool $isCreate = false): void
    {
        if ($validated['role'] === 'sales') {
            $user->customer()->delete();
            $user->sale()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $validated['phone'] ?? '',
                    'created_by' => $isCreate ? auth()->id() : ($user->sale?->created_by ?? auth()->id()),
                ]
            );

            return;
        }

        $user->sale()->delete();
        $user->customer()->delete();
    }

    private function deleteErrorMessage(bool $bulk, QueryException $exception): string
    {
        if ($this->isForeignKeyRestrictionViolation($exception)) {
            return $bulk
                ? 'Unable to delete the selected users because they are referenced by related records.'
                : 'Unable to delete this user because it is referenced by related records.';
        }

        return $bulk
            ? 'Unable to delete the selected users due to a database error.'
            : 'Unable to delete this user due to a database error.';
    }

    private function isForeignKeyRestrictionViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? null;
        $driverCode = $exception->errorInfo[1] ?? null;

        return $sqlState === '23000' && in_array((int) $driverCode, [1451, 1452], true);
    }
}
